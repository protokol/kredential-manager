import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/issuer.service';

@Controller('auth')
export class AuthController {
    constructor(private provider: OpenIDProviderService) { }
    @Get('.well-known/openid-configuration')
    @Public(true)
    getOpenIdConfiguration() {
        return this.provider.getMetadata();
    }
}