import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/openId.service';
import { IssuerService } from 'src/issuer/issuer.service';

@Controller('')
export class AuthController {
    constructor(private provider: OpenIDProviderService, private issuer: IssuerService) { }
    @Get('.well-known/openid-configuration')
    @Public(true)
    getOpenIdConfiguration() {
        return this.provider.getMetadata();
    }

    @Get('jwks')
    @Public(true)
    getJwks() {
        const keyWithKid = this.issuer.getPublicKeyJwk();
        return { keys: [keyWithKid] };
    }
}