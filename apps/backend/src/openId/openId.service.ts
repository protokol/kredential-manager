import { Injectable } from '@nestjs/common';
import { OpenIdProvider, generateDidFromPrivateKey, getOpenIdProviderMetadata } from '@protokol/ebsi-core';

const HOST = 'localhost:3000';

@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;

    constructor() {
        const privateKeyID = process.env.ISSUER_PRIVATE_KEY_ID;
        const defaultMetadata = getOpenIdProviderMetadata(HOST);
        const { did,
            privateKeyJwk,
            publicKeyJwk } = generateDidFromPrivateKey(process.env.ISSUER_PRIVATE_KEY, privateKeyID);
        console.log('privateKeyJwk', privateKeyJwk);
        this.provider = new OpenIdProvider(defaultMetadata, privateKeyJwk);
    }

    getMetadata() {
        return this.provider.getMetadata();
    }

    verifyAuthorizatioAndReturnIdTokenRequest(request: any) {
        return this.provider.verifyAuthorizatioAndReturnIdTokenRequest(request);
    }
}