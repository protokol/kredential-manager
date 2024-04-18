import { Body, Controller, Get, Post, Query, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { OpenIDProviderService } from '../openId/openId.service';
import { IssuerService } from 'src/issuer/issuer.service';
import { AuthorizeRequest } from '@protokol/ebsi-core';
import { JWK } from 'jose';
import { ApiTags } from '@nestjs/swagger';

interface JWKS {
    keys: JWK[];
}

@Controller('')
@ApiTags('OIDC')
export class AuthController {
    constructor(private provider: OpenIDProviderService, private issuer: IssuerService) { }
    @Get('.well-known/openid-configuration')
    @Public(true)
    getIssuerMetadata() {
        return this.provider.getIssuerMetadata();
    }

    @Get('.well-known/openid-credential-issuer')
    @Public(true)
    getConfigMetadata() {
        return this.provider.getConfigMetadata();
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
            const { header, redirectUrl, requestedCredentials } = await this.provider.verifyAuthorizatioAndReturnIdTokenRequest(req)
            // TODO Save requestedCredentials
            for (const [key, value] of Object.entries(header)) {
                res.setHeader(key, value);
            }
            console.log({ req })
            return res.redirect(302, redirectUrl);
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
        console.log({ req })
        try {
            const kid = headers['kid'] as string;
            const alg = headers['alg'] as string;
            const typ = headers['typ'] as string;

            if (!kid || !alg || !typ) {
                return res.status(400).json({ message: 'Missing required headers.' });
            }
            await this.provider.verifyIdTokenResponse(req, kid, alg, typ);
            const code = "SplxlOBeZQQYbYS6WxSbIA"
            const state = "af0ifjsldkj"
            const redirectUrl = await this.provider.composeAuthorizationResponse(code, state);
            console.log({ redirectUrl })
            return res.redirect(302, redirectUrl);
        } catch (error) {
            console.log("!!!!!!!")
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('token')
    @Public(true)
    async tokenRequest(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>
    ) {
        try {
            const response = await this.provider.composeTokenResponse();
            return res.status(200).json(response);
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

            // TODO Get the requested credential from the Auth request,.. use nonce ...
            // TODO Fill the credential for the requested credential
            // TODO Save the credential to the database
            const credential = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1"
                ],
                "type": ["VerifiableCredential", "UniversityDegreeCredential"],
                "credentialSubject": {
                    "id": "did:key:ebfeb1f712ebc6f1c276e12ec21",
                    "degree": {
                        "type": "BachelorDegree",
                        "name": "Bachelor of Science in Computer Science",
                        "degreeType": "Undergraduate",
                        "degreeSchool": "Best University",
                        "degreeDate": "2023-04-18"
                    }
                }
            }
            const response = await this.provider.composeCredentialResponse('jwt_vc', 'cnonce', credential);
            return res.status(200).json(response);
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({ message: error.message });
        }
    }
}
