import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, IdTokenResponse, JwtHeader, OpenIdProvider, TokenRequestBody, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@protokol/ebsi-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { IdTokenResponseRequest } from '@protokol/ebsi-core/dist/OpenIdProvider/interfaces/id-token-response.interface';
import { mapHeadersToJwtHeader } from './auth.utils';
import { decodeJwt } from 'jose';
import { randomBytes } from 'crypto';
import { AuthNonce } from './../nonce/interfaces/auth-nonce.interface';
import { NonceStep } from './../nonce/enum/step.enum';
import { NonceStatus } from 'src/nonce/enum/status.enum';
@Injectable()
export class AuthService {

    constructor(private provider: OpenIDProviderService, private issuer: IssuerService, private nonce: NonceService) { }

    async authorize(request: AuthorizeRequest): Promise<{ header: JwtHeader, code: number, url: string }> {

        // Verify the authorization request and return the header, redirect URL, requested credentials and server defined state
        const { header, redirectUrl, requestedCredentials, serverDefinedState } = await this.provider.handleAuthorizationRequest(request)

        // Verify if the requested credentials are supported by the issuer
        if (this.provider.verifyRequestedCredentials(requestedCredentials) === false) {
            throw new Error('Requested credentials are not supported by the issuer.');
        }

        // Create a nonce for the client
        const noncePayload: AuthNonce = {
            requestedCredentials: requestedCredentials,
            redirectUri: request.redirect_uri,
            serverDefinedState: serverDefinedState,
            clientDefinedState: request.state,
            codeChallenge: request.code_challenge,
        }
        await this.nonce.createAuthNonce(request.client_id, request.nonce, noncePayload);

        return { header, code: 302, url: redirectUrl };
    }


    async directPost(request: IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header: JwtHeader, code: number, url: string }> {
        const header = await mapHeadersToJwtHeader(headers);
        const decodedRequest = await this.provider.decodeIdTokenRequest(request.id_token)
        // Get nonce => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonce(decodedRequest.nonce, NonceStep.AUTHORIZE, NonceStatus.UNCLAIMED, decodedRequest.iss);

        // Verify the ID token response 

        const state = nonceData.payload.clientDefinedState;
        const code = randomBytes(50).toString("base64url");
        await this.nonce.createAuthResponseNonce(decodedRequest.nonce, code);
        const redirectUrl = await this.provider.createAuthorizationRequest(code, state);
        // console.log({ nonceData })

        // console.log({ code })

        // this.nonce.deleteNonce(decodedRequest.nonce); //TMP
        return { header, code: 302, url: redirectUrl };
    }

    async token(request: TokenRequestBody): Promise<{ header: any, code: number, url: string }> {
        console.log({ request })
        const response = await this.provider.composeTokenResponse();
        // console.log({ response })
        // create a json header

        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const nonceData = await this.nonce.getNonceByCode(request.code, NonceStep.AUTH_RESPONSE, NonceStatus.UNCLAIMED, request.client_id);

        console.log({ nonceData })

        console.log('Code: ', request.code)
        console.log('Code challenge: ', nonceData.payload.codeChallenge)
        console.log('Verifier: ', request.code_verifier)

        if (this.provider.validateCodeChallenge(nonceData.payload.codeChallenge, request.code_verifier) !== true) {
            throw new Error('Invalid code challenge.');
        }


        return { header, code: 200, url: response };
    }
}