import { Injectable } from '@nestjs/common';
import { Issuer, getOpenIdProviderMetadata } from '@protokol/ebsi-core';

const HOST = 'localhost:3000';

@Injectable()
export class IssuerService {
    private issuer: Issuer;

    constructor() {
        const defaultMetadata = getOpenIdProviderMetadata(HOST);
        this.issuer = new Issuer(defaultMetadata);
    }

    getMetadata() {
        return this.issuer.getMetadata();
    }

}