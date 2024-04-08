import { OpenIdProviderMetadata } from "./interfaces/OpenIdProviderMetadata";

export class OpenIdProvider {
    private metadata: OpenIdProviderMetadata;

    constructor(metadata: OpenIdProviderMetadata) {
        this.metadata = metadata;
    }

    getMetadata() {
        return this.metadata;
    }
}