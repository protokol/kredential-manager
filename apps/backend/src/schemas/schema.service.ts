import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialSchema } from '../entities/credential-schema.entity';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { CreateSchemaDto, UpdateSchemaDto } from './schema.types';

@Injectable()
export class SchemaService {
    private ajv: Ajv;

    constructor(
        @InjectRepository(CredentialSchema)
        private schemaRepository: Repository<CredentialSchema>
    ) {
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
    }

    async create(createSchemaDto: CreateSchemaDto): Promise<CredentialSchema> {
        try {
            this.ajv.compile(createSchemaDto.schema);
        } catch (error) {
            throw new BadRequestException(`Invalid schema: ${error.message}`);
        }

        const schema = this.schemaRepository.create(createSchemaDto);
        return await this.schemaRepository.save(schema);
    }

    async validate(schemaId: number, data: any): Promise<boolean> {
        const schema = await this.findOne(schemaId);
        if (!schema) {
            throw new NotFoundException('Schema not found');
        }

        const validate = this.ajv.compile(schema.schema);
        const isValid = validate(data);

        if (!isValid) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: validate.errors
            });
        }

        return true;
    }

    async findAll(): Promise<CredentialSchema[]> {
        return await this.schemaRepository.find();
    }

    async findOne(id: number): Promise<CredentialSchema> {
        const schema = await this.schemaRepository.findOne({ where: { id } });
        if (!schema) {
            throw new NotFoundException('Schema not found');
        }
        return schema;
    }

    async update(id: number, updateSchemaDto: UpdateSchemaDto): Promise<CredentialSchema> {
        const schema = await this.findOne(id);
        Object.assign(schema, updateSchemaDto);
        return await this.schemaRepository.save(schema);
    }

    async remove(id: number): Promise<void> {
        const schema = await this.findOne(id);
        await this.schemaRepository.remove(schema);
    }
}