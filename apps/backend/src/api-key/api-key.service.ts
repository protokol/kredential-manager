import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { randomBytes } from 'crypto';
@Injectable()
export class ApiKeyService {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,
    ) { }

    async createApiKey(name: string, allowedCredentialTypes: string[]): Promise<ApiKey> {
        const key = randomBytes(32).toString('hex');

        const apiKey = this.apiKeyRepository.create({
            key,
            name,
            allowedCredentialTypes
        });

        return await this.apiKeyRepository.save(apiKey);
    }

    async listApiKeys(): Promise<ApiKey[]> {
        return await this.apiKeyRepository.find({
            select: ['id', 'name', 'created_at', 'expires_at', 'isActive', 'allowedCredentialTypes']
        });
    }

    async revokeApiKey(id: number): Promise<void> {
        const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
        if (!apiKey) {
            throw new NotFoundException('API key not found');
        }

        apiKey.isActive = false;
        await this.apiKeyRepository.save(apiKey);
    }
}