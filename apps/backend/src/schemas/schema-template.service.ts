import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialSchema } from '../entities/credential-schema.entity';
import { v4 as uuidv4 } from 'uuid';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateSchemaDto } from './create-schema';
import { isReservedVariable, RESERVED_TEMPLATE_VARIABLES } from './reserver-variables';

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
            templateVariables: templateVars
        });

        return await this.schemaTemplateRepository.save(schema);
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
                throw new BadRequestException(
                    `Missing validation rule for template variable: ${variable}`
                );
            }
        }
    }

    async validateData(schemaId: number, data: any): Promise<boolean> {
        const schema = await this.schemaTemplateRepository.findOne({ where: { id: schemaId } });
        if (!schema) {
            throw new BadRequestException('Schema not found');
        }

        // Validate each field against its rules
        for (const [key, value] of Object.entries(data)) {
            const rule = schema.validationRules[key];
            if (!rule) continue;

            if (rule.required && !value) {
                throw new BadRequestException(`${key} is required`);
            }

            if (rule.pattern && typeof value === 'string') {
                const regex = new RegExp(rule.pattern);
                if (!regex.test(value)) {
                    throw new BadRequestException(
                        `${key} does not match pattern ${rule.pattern}`
                    );
                }
            }

        }

        return true;
    }
}
