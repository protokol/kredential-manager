import { Injectable } from '@nestjs/common';
import { IdTokenResponse, IdTokenResponseDecoded, OpenIdProvider, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@protokol/ebsi-core';
import { IdTokenResponseRequest } from '@protokol/ebsi-core/dist/OpenIdProvider/interfaces/id-token-response.interface';

const HOST = 'localhost:3000';

@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;

    constructor() {
        const privateKeyID = process.env.ISSUER_PRIVATE_KEY_ID;
        const issuerMetadata = getOpenIdIssuerMetadata(HOST);
        const configMetadata = getOpenIdConfigMetadata(HOST);
        const { did,
            privateKeyJwk,
            publicKeyJwk } = generateDidFromPrivateKey(process.env.ISSUER_PRIVATE_KEY, privateKeyID);
        this.provider = new OpenIdProvider(issuerMetadata, configMetadata, privateKeyJwk);
    }

    getConfigMetadata() {
        return this.provider.getIssuerMetadata();
    }

    getIssuerMetadata() {
        return this.provider.getConfigMetadata();
    }

    verifyRequestedCredentials(requestedCredentials: string[]) {
        return this.provider.verifyRequestedCredentials(requestedCredentials);
    }

    validateCodeChallenge(codeChallenge: string, codeVerifier: string): boolean {
        return this.provider.validateCodeChallenge(codeChallenge, codeVerifier);
    }

    handleAuthorizationRequest(request: any) {
        return this.provider.handleAuthorizationRequest(request);
    }

    decodeIdTokenRequest(request: any): Promise<IdTokenResponseDecoded> {
        return this.provider.decodeIdTokenRequest(request);
    }

    createAuthorizationRequest(code: string, state: string): Promise<string> {
        return this.provider.createAuthorizationRequest(code, state);
    }

    composeAuthorizationResponse(code: string, state: string) {
        return this.provider.composeAuthorizationResponse(code, state);
    }

    composeTokenResponse() {
        return this.provider.composeTokenResponse();
    }

    composeCredentialResponse(format: string, cNonce: string, unsignedCredential: any) {
        return this.provider.composeCredentialResponse(format, cNonce, unsignedCredential);
    }
}