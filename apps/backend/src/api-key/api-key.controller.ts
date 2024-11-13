import { Controller, Post, Body, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('api-keys')
@ApiTags('API Keys')
@ApiBearerAuth()
export class ApiKeyController {
    constructor(private apiKeyService: ApiKeyService) { }

    @Post()
    async createApiKey(
        @Body() body: { name: string; didIdentifier: string; allowedCredentialTypes: string[] }
    ) {
        return await this.apiKeyService.createApiKey(
            body.name,
            body.didIdentifier,
            body.allowedCredentialTypes
        );
    }

    @Get()
    async listApiKeys() {
        return await this.apiKeyService.listApiKeys();
    }

    @Delete(':id')
    async revokeApiKey(@Param('id') id: string) {
        return await this.apiKeyService.revokeApiKey(parseInt(id));
    }
}