import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/openId.service';
import { IssuerService } from 'src/issuer/issuer.service';
import { AuthorizeRequest } from '@protokol/ebsi-core';
import { JWK } from 'jose';

interface JWKS {
    keys: JWK[];
}

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
    getJwks(): JWKS {
        const keyWithKid = this.issuer.getPublicKeyJwk();
        return {
            keys: [keyWithKid]
        };
    }

    @Get('authorize')
    @Public(true)
    async authorize(
        @Query() req: AuthorizeRequest,
        @Res() res: Response,
    ) {
        try {
            const { header, redirectUrl } = await this.provider.verifyAuthorizatioAndReturnIdTokenRequest(req)
            for (const [key, value] of Object.entries(header)) {
                res.setHeader(key, value);
            }
            return res.redirect(302, redirectUrl);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }
}
