import { Controller, Get, Post, Delete, Param, Body, NotFoundException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ScopeCredentialMapping } from '../entities/scope-credential-mapping.entity';
import { ScopeCredentialMappingService } from './scope-mapping.service';

@ApiTags('Scope Credential Mappings')
@Controller('scope-credential-mappings')
export class ScopeCredentialMappingController {
    constructor(private readonly mappingService: ScopeCredentialMappingService) { }

    @ApiOperation({ summary: 'Create a new mapping between a presentation definition and a credential schema' })
    @ApiResponse({ status: 201, description: 'The mapping has been successfully created.', type: ScopeCredentialMapping })
    @ApiResponse({ status: 404, description: 'PresentationDefinition or CredentialSchema not found.' })
    @ApiResponse({ status: 409, description: 'A schema is already bound to the scope.' })
    @ApiBody({ description: 'The IDs of the presentation definition and credential schema', type: Object })
    @Post()
    async create(@Body() body: { presentationDefinitionId: number, credentialSchemaId: number }): Promise<ScopeCredentialMapping> {
        try {
            return await this.mappingService.create(body.presentationDefinitionId, body.credentialSchemaId);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new Error('Failed to create mapping');
        }
    }

    @ApiOperation({ summary: 'Retrieve all mappings' })
    @ApiResponse({ status: 200, description: 'An array of all scope-credential mappings.', type: [ScopeCredentialMapping] })
    @Get()
    async findAllMappings(): Promise<ScopeCredentialMapping[]> {
        return this.mappingService.findAllMappings();
    }

    @ApiOperation({ summary: 'Retrieve a specific mapping by its ID' })
    @ApiResponse({ status: 200, description: 'The requested mapping.', type: ScopeCredentialMapping })
    @ApiResponse({ status: 404, description: 'Mapping not found.' })
    @ApiParam({ name: 'id', description: 'The ID of the mapping to retrieve' })
    @Get(':id')
    async findMappingById(@Param('id') id: number): Promise<ScopeCredentialMapping> {
        const mapping = await this.mappingService.findMappingById(id);
        if (!mapping) {
            throw new NotFoundException(`Mapping with ID ${id} not found`);
        }
        return mapping;
    }

    @ApiOperation({ summary: 'Delete a specific mapping by its ID' })
    @ApiResponse({ status: 200, description: 'Mapping deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Mapping not found.' })
    @ApiParam({ name: 'id', description: 'The ID of the mapping to delete' })
    @Delete(':id')
    async deleteMapping(@Param('id') id: number): Promise<{ message: string }> {
        await this.mappingService.deleteMapping(id);
        return { message: `Mapping with ID ${id} deleted successfully` };
    }
}