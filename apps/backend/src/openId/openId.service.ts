import { Injectable } from '@nestjs/common';
import { IdTokenResponse, OpenIdProvider, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@protokol/ebsi-core';

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

    verifyAuthorizatioAndReturnIdTokenRequest(request: any) {
        return this.provider.verifyAuthorizatioAndReturnIdTokenRequest(request);
    }

    verifyIdTokenResponse(request: IdTokenResponse, kid: string, alg: string, typ: string) {
        return this.provider.verifyIdTokenResponse(request, kid, alg, typ);
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