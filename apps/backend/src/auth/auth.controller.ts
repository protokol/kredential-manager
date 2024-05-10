import { Body, Controller, Get, Post, Query, Res, Headers, Inject } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/openId.service';
import { IssuerService } from 'src/issuer/issuer.service';
import { AuthorizeRequest, IdTokenResponse, TokenRequestBody, parseDuration } from '@protokol/ebsi-core';
import { JWK } from 'jose';
import { ApiTags } from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-authorization.dto';
import { AuthService } from './auth.service';

interface JWKS {
    keys: JWK[];
}

@Controller('')
@ApiTags('OIDC')
export class AuthController {

    constructor(private provider: OpenIDProviderService, private issuer: IssuerService, private auth: AuthService) { }


    @Get('.well-known/openid-credential-issuer')
    @Public(true)
    getIssuerMetadata() {
        return this.provider.getInstance().getIssuerMetadata();
    }

    @Get('.well-known/openid-configuration')
    @Public(true)
    getConfigMetadata() {
        return this.provider.getInstance().getConfigMetadata();
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
            console.log("Authorize")
            const { header, code, url } = await this.auth.authorize(req);
            for (const [key, value] of Object.entries(header)) {
                res.setHeader(key, value);
            }
            return res.redirect(code, url);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('direct_post')
    @Public(true)
    async directPost(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>
    ) {
        try {
            const { header, code, url } = await this.auth.directPost(req, headers);
            return res.redirect(code, url);
        } catch (error) {
            console.log("!!!!!!!")
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('token')
    @Public(true)
    async tokenRequest(
        @Body() req: TokenRequestBody,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>
    ) {
        try {
            const { header, code, response } = await this.auth.token(req);
            return res.status(code).json(response);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('credential')
    @Public(true)
    async credentialsRequest(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>
    ) {
        try {
            const { header, code, response } = await this.auth.credentail(req);
            return res.status(code).json(response);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('credential_deferred')
    @Public(true)
    async credentialsDeferredRequest(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>
    ) {
        try {
            const { header, code, response } = await this.auth.credentailDeferred(req);
            return res.status(code).json(response);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }
}
