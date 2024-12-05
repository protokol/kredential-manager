import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import { EbsiError } from '../error/ebsi-error';
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
                throw new Error('Invalid scope format. Scope must start with "openid" with a ":" in between.');
            }
            const id = `${dto.scope.replace(':', '_')}_presentation`;
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
        });
    }

    async findOne(id: number): Promise<PresentationDefinition> {
        console.log("FINDING PRESENTATION DEFINITION")
        console.log(id)
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
        await this.presentationDefinitionRepo.delete(id);
    }

    async getByScope(scope: string): Promise<any> {
        if (scope.concat('_presentation')) {
            scope = scope.replace('_presentation', '');
        }
        const id = `${scope.replace(':', '_')}_presentation`;
        console.log("GETTING PRESENTATION DEFINITION BY SCOPE")
        console.log(id)
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
}