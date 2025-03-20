import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Res,
    Headers,
    Inject,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { Public } from "nest-keycloak-connect";
import { OpenIDProviderService } from "../openId/openId.service";
import { IssuerService } from "./../issuer/issuer.service";
import {
    AuthorizeRequest,
    JWK,
    TokenRequestBody,
} from "@protokol/kredential-core";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { handleError } from "src/error/ebsi-error.util";

interface JWKS {
    keys: JWK[];
}

@Controller("")
@ApiTags("OIDC")
export class AuthController {
    constructor(
        private provider: OpenIDProviderService,
        private issuer: IssuerService,
        private auth: AuthService,
    ) {}

    @Get(".well-known/openid-credential-issuer")
    @Public(true)
    @ApiOperation({ summary: "Get issuer metadata" })
    async getIssuerMetadata() {
        const provider = await this.provider.getInstance();
        return provider.getIssuerMetadata();
    }

    @Get("authorize/.well-known/openid-configuration")
    @Public(true)
    @ApiOperation({ summary: "Get configuration metadata" })
    async getConfigMetadata() {
        const provider = await this.provider.getInstance();
        return provider.getConfigMetadata();
    }

    @Get("jwks")
    @Public(true)
    @ApiOperation({ summary: "Get JWKS" })
    getJwks(): JWKS {
        const keyWithKid = this.issuer.getPublicKeyJwk();
        return {
            keys: [keyWithKid],
        };
    }

    @Get("authorize")
    @Public(true)
    @ApiOperation({ summary: "Authorize" })
    async authorize(@Query() req: AuthorizeRequest, @Res() res: Response) {
        try {
            const { code, url } = await this.auth.authorize(req);
            return res.redirect(code, url);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Get("verifier")
    @Public(true)
    @ApiOperation({ summary: "Verifier" })
    async verifier(@Query() req: AuthorizeRequest, @Res() res: Response) {
        try {
            const { code, url } = await this.auth.authorize(req);
            return res.redirect(code, url);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Post("direct_post")
    @Public(true)
    @ApiOperation({ summary: "Direct Post" })
    async directPost(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>,
    ) {
        try {
            const { code, url } = await this.auth.directPost(req, headers);

            return res.redirect(code, url);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Post("token")
    @Public(true)
    @ApiOperation({ summary: "Token Request" })
    async tokenRequest(
        @Body() req: TokenRequestBody,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>,
    ) {
        try {
            const { header, code, response } = await this.auth.token(req);
            return res.status(code).json(response);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Post("credential")
    @Public(true)
    @ApiOperation({ summary: "Credentials Request" })
    async credentialsRequest(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>,
    ) {
        try {
            const { code, response } = await this.auth.credentail(req);
            return res.status(code).json(response);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Post("credential_deferred")
    @Public(true)
    @ApiOperation({ summary: "Credentials Deferred Request" })
    async credentialsDeferredRequest(
        @Body() req: any,
        @Res() res: Response,
        @Headers() headers: Record<string, string | string[]>,
    ) {
        try {
            const { code, response } = await this.auth.credentilDeferred(
                req,
                headers,
            );
            return res.status(code).json(response);
        } catch (error) {
            throw handleError(error);
        }
    }
}
