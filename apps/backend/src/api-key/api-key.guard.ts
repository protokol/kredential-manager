import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const apiKeyEntity = await this.apiKeyRepository.findOne({
            where: { key: apiKey as string, isActive: true },
            relations: ['did']
        });

        if (!apiKeyEntity) {
            throw new UnauthorizedException('Invalid API key');
        }

        if (apiKeyEntity.expires_at && apiKeyEntity.expires_at < new Date()) {
            throw new UnauthorizedException('API key has expired');
        }

        return true;
    }
}