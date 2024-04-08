import { OpenIdProviderMetadata } from "./interfaces/OpenIdProviderMetadata";

export class Issuer {
    private metadata: OpenIdProviderMetadata;

    constructor(metadata: OpenIdProviderMetadata) {
        console.log('Issuer constructor')
        this.metadata = metadata;
    }

    getMetadata() {
        return this.metadata;
    }
}