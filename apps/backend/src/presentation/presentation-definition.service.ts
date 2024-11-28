import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import { EbsiError } from '../error/ebsi-error';
import { generateRandomString } from 'src/credential-offer/random';
import { CreatePresentationDefinitionDto } from './dto/create-presentation-definition';
import { UpdatePresentationDefinitionDto } from './dto/update-presentation-definition';

@Injectable()
export class PresentationDefinitionService {
    constructor(
        @InjectRepository(PresentationDefinition)
        private presentationDefinitionRepo: Repository<PresentationDefinition>
    ) { }

    async create(dto: CreatePresentationDefinitionDto): Promise<PresentationDefinition> {
        const definition = this.presentationDefinitionRepo.create({
            ...dto,
            definition: {
                ...dto.definition,
                id: generateRandomString(32) // Ensure unique ID
            }
        });
        return await this.presentationDefinitionRepo.save(definition);
    }

    async findAll(): Promise<PresentationDefinition[]> {
        return await this.presentationDefinitionRepo.find({
            where: { isActive: true }
        });
    }

    async findOne(id: number): Promise<PresentationDefinition> {
        const definition = await this.presentationDefinitionRepo.findOne({
            where: { id, isActive: true }
        });
        if (!definition) {
            throw new EbsiError('invalid_request', 'Presentation definition not found');
        }
        return definition;
    }

    async update(id: number, dto: UpdatePresentationDefinitionDto): Promise<PresentationDefinition> {
        const definition = await this.findOne(id);
        Object.assign(definition, dto);
        return await this.presentationDefinitionRepo.save(definition);
    }

    async remove(id: number): Promise<void> {
        const definition = await this.findOne(id);
        definition.isActive = false;
        await this.presentationDefinitionRepo.save(definition);
    }

    // Method to expose definition through presentation_definition_uri
    async getDefinitionById(definitionId: string): Promise<any> {
        console.log('definitionId', definitionId);
        const definition = await this.presentationDefinitionRepo.findOne({
            where: {
                isActive: true,
                definition: Raw(alias => `${alias} ->> 'id' = :definitionId`, { definitionId })
            }
        });
        if (!definition) {
            throw new EbsiError(
                'invalid_request',
                'Presentation definition not found'
            );
        }
        return definition.definition;
    }
}