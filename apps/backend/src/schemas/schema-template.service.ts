import { Injectable, BadRequestException, NotFoundException, HttpStatus, HttpException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialSchema } from '../entities/credential-schema.entity';
import { v4 as uuidv4 } from 'uuid';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateSchemaDto } from './create-schema';
import { isReservedVariable, RESERVED_TEMPLATE_VARIABLES } from './reserver-variables';
import { EbsiNetwork } from 'src/network/ebsi-network.types';
import { getOrder } from 'src/helpers/Order';
import { PaginatedResource } from 'src/types/pagination/dto/PaginatedResource';
import { getWhere } from 'src/helpers/Order';
import { Pagination } from 'src/types/pagination/PaginationParams';
import { Filtering } from 'src/types/pagination/FilteringParams';
import { Sorting } from 'src/types/pagination/SortingParams';

@Injectable()
export class SchemaTemplateService {
    private ajv: Ajv;

    constructor(
        @InjectRepository(CredentialSchema)
        private schemaTemplateRepository: Repository<CredentialSchema>,
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
        const schema = createDto.schema;
        const types = createDto.schema.type;
        const templateVars = this.extractTemplateVariables(createDto.schema);
        const existingSchemas = await this.schemaTemplateRepository.find();
        this.validateTemplateVariables(templateVars, createDto.validationRules);

        // Check if any existing schema has the same type
        for (const schema of existingSchemas) {
            if (this.arraysAreEqual(schema.types, createDto.schema.type)) {
                throw new Error('A schema with the same type already exists.');
            }
        }
        const schemaToSave = this.schemaTemplateRepository.create({
            ...createDto,
            types: types,
            templateVariables: templateVars
        });

        return await this.schemaTemplateRepository.save(schemaToSave);
    }

    private arraysAreEqual(array1: string[], array2: string[]): boolean {
        if (array1.length !== array2.length) return false;

        const sortedArray1 = [...array1].sort();
        const sortedArray2 = [...array2].sort();

        for (let i = 0; i < sortedArray1.length; i++) {
            if (sortedArray1[i] !== sortedArray2[i]) return false;
        }
        return true;
    }

    async findOne(id: number) {
        return await this.schemaTemplateRepository.findOne({ where: { id } });
    }

    async findAll(
        { page, limit, size, offset }: Pagination,
        sort?: Sorting,
        filter?: Filtering,
    ): Promise<PaginatedResource<Partial<CredentialSchema>>> {
        const where = getWhere(filter);
        const order = getOrder(sort);

        const [items, total] = await this.schemaTemplateRepository.findAndCount({
            where,
            order,
            take: limit,
            skip: offset,
        });

        return {
            totalItems: total,
            items: items,
            page,
            size,
        };
    }

    async getTrustFramework(id: number) {
        const schema = await this.findOne(id);
        return schema?.trust_framework;
    }

    async update(id: number, updateDto: Partial<CreateSchemaDto & { types: string[] }>) {
        const schema = await this.findOne(id);
        if (!schema) {
            throw new ConflictException('Schema template not found');
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
            throw new ConflictException('Schema template not found');
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
                throw new ConflictException(`Missing validation rule for template variable: ${variable}`);
            }
        }
    }

    async generateCredential(issuerDid: string, subjectDid: string, schemaId: number, data: any) {
        const schema = await this.findOne(schemaId);
        if (!schema) {
            throw new ConflictException('Schema template not found');
        }

        let credentialTemplate = this.replaceReservedVariables(
            schema.schema,
            issuerDid,
            subjectDid
        );

        // If there are template variables, replace them with the data
        if (schema.templateVariables.length > 0) {
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
        }

        return credentialTemplate;
    }

    async getCredentialsSupported(): Promise<any[]> {
        const isConformance = process.env.EBSI_NETWORK === EbsiNetwork.CONFORMANCE;
        let credentialsSupported = [];
        if (isConformance) {
            // credentialsSupported = this.getConformanceCredentials();
        }

        const templates = await this.schemaTemplateRepository.find();
        credentialsSupported.push(...templates.map(template => ({
            format: template.format,
            types: template.schema.type, // Using existing schema types
            trust_framework: template.trust_framework,
            display: template.display,
            issuance_criteria: template.schema.issuance_criteria
        })));

        return credentialsSupported;
    }

    private getConformanceCredentials() {
        return [
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
