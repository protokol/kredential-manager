import { Controller, Post, Body, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { handleError } from 'src/error/ebsi-error.util';

@Controller('api-keys')
@ApiTags('API Keys')
@ApiBearerAuth()
export class ApiKeyController {
    constructor(private apiKeyService: ApiKeyService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new API key' })
    @ApiResponse({ status: 201, description: 'API key created successfully' })
    @ApiBody({
        description: 'The API key to create',
        schema: { example: { name: 'My API Key', allowedCredentialTypes: ['DiplomaCredential'] } }
    })
    async createApiKey(
        @Body() body: { name: string; allowedCredentialTypes: string[] }
    ) {
        return await this.apiKeyService.createApiKey(
            body.name,
            body.allowedCredentialTypes
        );
    }

    @Get()
    @ApiOperation({ summary: 'List all API keys' })
    @ApiResponse({ status: 200, description: 'API keys retrieved successfully' })
    async listApiKeys() {
        return await this.apiKeyService.listApiKeys();
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an API key' })
    async deleteApiKey(@Param('id') id: number) {
        try {
            await this.apiKeyService.deleteApiKey(id);
            return { message: 'API key deleted successfully' };
        } catch (error) {
            throw handleError(error);
        }
    }
}