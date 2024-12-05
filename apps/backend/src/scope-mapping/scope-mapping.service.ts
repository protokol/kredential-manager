import { CredentialSchema } from "@entities/credential-schema.entity";
import { PresentationDefinition } from "@entities/presentation-definition.entity";
import { ScopeCredentialMapping } from "@entities/scope-credential-mapping.entity";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ScopeCredentialMappingService {
    constructor(
        @InjectRepository(ScopeCredentialMapping)
        private readonly mappingRepo: Repository<ScopeCredentialMapping>,
        @InjectRepository(PresentationDefinition)
        private readonly presentationDefinitionRepo: Repository<PresentationDefinition>,
        @InjectRepository(CredentialSchema)
        private readonly credentialSchemaRepo: Repository<CredentialSchema>,
    ) { }

    async create(presentationDefinitionId: number, credentialSchemaId: number): Promise<ScopeCredentialMapping> {
        const presentationDefinition = await this.presentationDefinitionRepo.findOne({ where: { id: presentationDefinitionId } });
        if (!presentationDefinition) {
            throw new NotFoundException(`PresentationDefinition with ID ${presentationDefinitionId} not found`);
        }

        const credentialSchema = await this.credentialSchemaRepo.findOne({ where: { id: credentialSchemaId } });
        if (!credentialSchema) {
            throw new NotFoundException(`CredentialSchema with ID ${credentialSchemaId} not found`);
        }

        // Template variables are not supported in scope mappings
        if (credentialSchema.templateVariables.length > 0) {
            throw new ConflictException(`CredentialSchema with ID ${credentialSchemaId} has template variables. Template variables are not supported in scope mappings.`);
        }

        const existingMapping = await this.mappingRepo.findOne({ where: { presentationDefinition: { id: presentationDefinitionId } } });
        if (existingMapping) {
            throw new ConflictException(`A schema is already bound to the scope with PresentationDefinition ID ${presentationDefinitionId}`);
        }

        const mapping = this.mappingRepo.create({ presentationDefinition, credentialSchema });
        return this.mappingRepo.save(mapping);
    }

    async findAllMappings(): Promise<ScopeCredentialMapping[]> {
        return this.mappingRepo.find({ relations: ['presentationDefinition', 'credentialSchema'] });
    }

    async findMappingById(id: number): Promise<ScopeCredentialMapping> {
        return this.mappingRepo.findOne({ where: { id }, relations: ['presentationDefinition', 'credentialSchema'] });
    }

    async deleteMapping(id: number): Promise<void> {
        const mapping = await this.findMappingById(id);
        if (!mapping) {
            throw new NotFoundException(`Mapping with ID ${id} not found`);
        }
        await this.mappingRepo.delete(id);
    }

    async getCredentialSchemaByScope(scope: string): Promise<CredentialSchema> {
        // Find the presentation definition by scope
        const id = `${scope.replace(':', '_')}_presentation`;
        const presentationDefinition = await this.presentationDefinitionRepo.findOne({ where: { scope: id } });
        if (!presentationDefinition) {
            throw new Error(`PresentationDefinition with scope ${scope} not found`);
        }

        // Find the mapping for the presentation definition
        const mapping = await this.mappingRepo.findOne({
            where: { presentationDefinition: { id: presentationDefinition.id } },
            relations: ['credentialSchema'],
        });

        if (!mapping) {
            throw new Error(`No credential schema found for scope ${scope}`);
        }

        // Return the credential schema
        return mapping.credentialSchema;
    }
}
