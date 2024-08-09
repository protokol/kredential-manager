import { Body, Controller, Get, Post, Query, Res, Headers, Inject } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { AuthorizeRequest, IdTokenResponse, JWK, TokenRequestBody, parseDuration } from '@probeta/mp-core';
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
        console.log("HERE")
        try {
            const { code, url } = await this.auth.authorize(req);
            return res.redirect(code, url);
        } catch (error) {
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
        console.log("DIRECT POST")
        console.log({ req })
        try {
            const { code, url } = await this.auth.directPost(req, headers);
            return res.redirect(code, url);
        } catch (error) {
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
            console.log({ error })
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
            const { code, response } = await this.auth.credentail(req);
            return res.status(code).json(response);
        } catch (error) {
            console.log({ error })
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
            const { code, response } = await this.auth.credentilDeferred(req);
            console.log({ response })
            console.log({ code })
            return res.status(code).json(response);
        } catch (error) {
            console.log({ error })
            return res.status(400).json({ message: error.message });
        }
    }

    @Get('query_params')
    @Public(true)
    async getQueryParams(
        @Query() req: any,
        @Res() res: Response
    ) {
        try {
            const queryParams = req;
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(queryParams);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
