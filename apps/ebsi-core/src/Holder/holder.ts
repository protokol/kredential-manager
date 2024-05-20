import { JWK } from "jose";
import { OpenIdConfiguration, OpenIdIssuer } from "../OpenIdProvider";
import { AuthService } from "./services/authService";
import { IssuerService } from "./services/issuerService";

/**
 * Represents a holder wallet.
 */
export class Holder {
    private issuerUrl: string;
    private did: string;
    private auth: AuthService;
    private issuer: IssuerService;

    /**
     * Constructs a new instance of RelyingParty.
     *
     * @param privateKey The private key used for cryptographic operations.
     * @param did The DID associated with the relying party.
     * @param issuerUrl The URL of the issuer (identity provider).
     */
    constructor(privateKey: JWK, did: string, issuerUrl: string) {
        this.issuerUrl = issuerUrl;
        this.did = did;
        this.auth = new AuthService(privateKey, did);
        this.issuer = new IssuerService();
    }

    /**
     * Discovers metadata about the issuer.
     *
     * @returns A promise that resolves to the discovered issuer metadata.
     */
    discoverIssuerMetadata(): Promise<OpenIdIssuer> {
        return this.issuer.discoverIssuerMetadata(this.issuerUrl);
    }

    /**
     * Discovers configuration metadata from the issuer.
     *
     * @returns A promise that resolves to the discovered configuration metadata.
     */
    discoverConfigurationMetadata(): Promise<OpenIdConfiguration> {
        return this.issuer.discoverConfigurationMetadata(this.issuerUrl);
    }

    /**
     * Authenticates with the issuer using the provided credentials.
     *
     * @param openIdIssuer The OpenID issuer object.
     * @param openIdMetadata The OpenID configuration metadata.
     * @param requestedCredentials An array of requested credentials.
     * @returns A promise that resolves to the result of the authentication process.
     */
    async authenticateWithIssuer(openIdIssuer: OpenIdIssuer, openIdMetadata: OpenIdConfiguration, requestedCredentials: string[]): Promise<any> {
        return this.auth.authenticateWithIssuer(openIdIssuer, openIdMetadata, requestedCredentials, this.did);
    }

    /**
     * Requests a credential from the issuer.
     *
     * @param openIdIssuer The OpenID issuer object.
     * @param requestedCredentials An array of requested credentials.
     * @param token The token obtained from the issuer.
     * @returns A promise that resolves to the requested credential.
     */
    async requestCredential(openIdIssuer: OpenIdIssuer, requestedCredentials: string[], token: any): Promise<any> {
        return this.issuer.requestCredential(openIdIssuer, requestedCredentials, token.access_token, token.c_nonce);
    }

    /**
     * Requests a deferred credential from the issuer.
     *
     * @param openIdIssuer The OpenID issuer object.
     * @param acceptanceToken The acceptance token received from the issuer.
     * @returns A promise that resolves to the deferred credential endpoint.
     */
    async deferredCredentialEndpoint(openIdIssuer: OpenIdIssuer, acceptanceToken: string): Promise<any> {
        return this.issuer.deferredCredentialEndpoint(openIdIssuer, acceptanceToken);
    }
}