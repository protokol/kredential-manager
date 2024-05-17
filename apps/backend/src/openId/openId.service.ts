import { Injectable } from '@nestjs/common';
import { OpenIdProvider, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@probeta/mp-core';


const HOST = process.env.ISSUER_BASE_URL || 'localhost:3000'; // The host of the application


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

    getInstance() {
        return this.provider;
    }
}