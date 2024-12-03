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
        try {
            const scopeParts = dto.scope.split(':');
            if (scopeParts.length !== 2 || scopeParts[0] !== 'openid') {
                throw new Error('Invalid scope format. Scope must start with "openid" and consist of two words.');
            }
            const id = `${dto.scope.replace(':', '-')}-presentation`;
            const definition = this.presentationDefinitionRepo.create({
                ...dto,
                definition: {
                    ...dto.definition,
                    id: id
                },
                scope: id
            });
            return await this.presentationDefinitionRepo.save(definition);
        } catch (error) {
            if (error.code === '23505') {
                throw new Error(`Scope "${dto.scope}" already exists.`);
            }
            throw error;
        }
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

    async getByScope(scope: string): Promise<any> {
        const id = `${scope.replace(':', '-')}-presentation`;
        const definition = await this.presentationDefinitionRepo.findOne({
            where: {
                isActive: true,
                scope: id
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

    async getUniqueScopes(): Promise<string[]> {
        const definitions = await this.presentationDefinitionRepo.find();
        const scopes = definitions.map(def => def.scope);
        return Array.from(new Set(scopes));
    }
}