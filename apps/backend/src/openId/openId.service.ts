import { Injectable } from '@nestjs/common';
import { OpenIdProvider, getOpenIdProviderMetadata } from '@protokol/ebsi-core';

const HOST = 'localhost:3000';

@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;

    constructor() {
        const defaultMetadata = getOpenIdProviderMetadata(HOST);
        this.provider = new OpenIdProvider(defaultMetadata);
    }

    getMetadata() {
        return this.provider.getMetadata();
    }

}