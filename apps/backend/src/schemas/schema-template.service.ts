import { Injectable, BadRequestException, NotFoundException, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialSchema } from '../entities/credential-schema.entity';
import { v4 as uuidv4 } from 'uuid';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateSchemaDto } from './create-schema';
import { isReservedVariable, RESERVED_TEMPLATE_VARIABLES } from './reserver-variables';
import { EbsiNetwork } from 'src/network/ebsi-network.types';
import { createError } from 'src/error/ebsi-error';

@Injectable()
export class SchemaTemplateService {
    private ajv: Ajv;

    constructor(
        @InjectRepository(CredentialSchema)
        private schemaTemplateRepository: Repository<CredentialSchema>
    ) {
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
    }

    private replaceReservedVariables(schema: any, issuerDid: string, subjectDid: string): any {
        const replaceInObject = (obj: any): any => {
            if (typeof obj === 'string') {
                let result = obj;
                // Type-safe replacement
                if (result === RESERVED_TEMPLATE_VARIABLES.UUID) {
                    result = uuidv4();
                }
                if (result === RESERVED_TEMPLATE_VARIABLES.ISSUER_DID) {
                    result = issuerDid;
                }
                if (result === RESERVED_TEMPLATE_VARIABLES.SUBJECT_DID) {
                    result = subjectDid;
                }
                if (result === RESERVED_TEMPLATE_VARIABLES.TIMESTAMP) {
                    result = new Date().toISOString();
                }
                return result;
            }
            if (Array.isArray(obj)) {
                return obj.map(item => replaceInObject(item));
            }
            if (typeof obj === 'object' && obj !== null) {
                const newObj: Record<string, any> = {};
                for (const [key, value] of Object.entries(obj)) {
                    newObj[key] = replaceInObject(value);
                }
                return newObj;
            }
            return obj;
        };

        return replaceInObject(schema);
    }

    async create(createDto: CreateSchemaDto) {
        const templateVars = this.extractTemplateVariables(createDto.schema);

        this.validateTemplateVariables(templateVars, createDto.validationRules);

        const schema = this.schemaTemplateRepository.create({
            ...createDto,
            types: createDto.schema.type,
            templateVariables: templateVars
        });

        return await this.schemaTemplateRepository.save(schema);
    }

    async findOne(id: number) {
        return await this.schemaTemplateRepository.findOne({ where: { id } });
    }

    async findAll(page: number = 1, limit: number = 10) {
        const [items, total] = await this.schemaTemplateRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { id: 'DESC' }
        });

        return {
            items,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getTrustFramework(id: number) {
        const schema = await this.findOne(id);
        return schema?.trust_framework;
    }

    async update(id: number, updateDto: Partial<CreateSchemaDto & { types: string[] }>) {
        const schema = await this.findOne(id);
        if (!schema) {
            throw createError('INVALID_REQUEST', 'Schema template not found');
        }

        // If schema is updated, extract and validate template variables
        if (updateDto.schema) {
            const templateVars = this.extractTemplateVariables(updateDto.schema);
            this.validateTemplateVariables(
                templateVars,
                updateDto.validationRules || schema.validationRules
            );
            updateDto.types = updateDto.schema.type;
        }

        Object.assign(schema, updateDto);
        return await this.schemaTemplateRepository.save(schema);
    }

    async remove(id: number) {
        const schema = await this.findOne(id);
        if (!schema) {
            throw createError('INVALID_REQUEST', 'Schema template not found');
        }

        await this.schemaTemplateRepository.remove(schema);
        return { message: 'Schema template deleted successfully' };
    }

    private extractTemplateVariables(obj: any): string[] {
        const vars = new Set<string>();
        const extract = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    const matches = obj[key].match(/\{\{(\w+)\}\}/g);
                    if (matches) {
                        matches.forEach(match => {
                            vars.add(match.replace(/\{\{|\}\}/g, ''));
                        });
                    }
                } else if (typeof obj[key] === 'object') {
                    extract(obj[key]);
                }
            }
        };
        extract(obj);
        return Array.from(vars);
    }

    private validateTemplateVariables(templateVars: string[], validationRules: Record<string, any>) {
        const nonReservedVars = templateVars.filter(variable => !isReservedVariable(variable));

        for (const variable of nonReservedVars) {
            if (!validationRules[variable]) {
                throw createError('INVALID_REQUEST', `Missing validation rule for template variable: ${variable}`);
            }
        }
    }

    async validateData(schemaId: number, data: any): Promise<{ isValid: boolean; errors?: string[] }> {
        const schema = await this.schemaTemplateRepository.findOne({ where: { id: schemaId } });
        if (!schema) {
            throw createError('INVALID_REQUEST', 'Schema not found');
        }

        const errors: string[] = [];
        for (const [field, rule] of Object.entries(schema.validationRules)) {
            if (rule.required && !data[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    async generateCredential(schemaId: number, data: any, issuerDid: string, subjectDid: string) {
        const schema = await this.findOne(schemaId);
        if (!schema) {
            throw createError('INVALID_REQUEST', 'Schema template not found');
        }

        let credentialTemplate = this.replaceReservedVariables(
            schema.schema,
            issuerDid,
            subjectDid
        );

        for (const [key, value] of Object.entries(data)) {
            if (!isReservedVariable(key)) {
                credentialTemplate = JSON.parse(
                    JSON.stringify(credentialTemplate).replace(
                        new RegExp(`{{${key}}}`, 'g'),
                        value as string
                    )
                );
            }
        }

        return credentialTemplate;
    }

    async getCredentialsSupported(): Promise<any[]> {
        const isConformance = process.env.EBSI_NETWORK === EbsiNetwork.CONFORMANCE;

        if (isConformance) {
            return this.getConformanceCredentials();
        }

        const templates = await this.schemaTemplateRepository.find();

        return templates.map(template => ({
            format: template.format,
            types: template.schema.type, // Using existing schema types
            trust_framework: template.trust_framework,
            display: template.display,
            issuance_criteria: template.schema.issuance_criteria
        }));
    }

    private getConformanceCredentials() {
        return [
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'UniversityDegree'],
                trust_framework: {
                    name: 'Evergreen Valley University',
                    type: 'Accreditation',
                    uri: 'https://evu.edu/accreditation'
                },
                display: [
                    {
                        name: 'University Degree',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Issuance criteria",
                supported_evidence_types: ["Template Evidence Type 1", "Template Evidence Type 2"]
            },
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'TemplateCredentialType2'],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [
                    {
                        name: 'Template Credential Display Name 2',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Template issuance criteria 2",
                supported_evidence_types: ["Template Evidence Type 3", "Template Evidence Type 4"]
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSameAuthorisedInTime'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 3",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSameAuthorisedDeferred'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 4",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSamePreAuthorisedInTime'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 5",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSamePreAuthorisedDeferred'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 6",
                supported_evidence_types: []
            },
        ];
    }
}
