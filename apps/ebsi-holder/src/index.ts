import { AuthRequestComposer, AuthorizationResponse, AuthorizeRequestSigned, ClientMetadata, IdTokenResponse, IdTokenResponseComposer, JwtHeader, ResponseType, TokenRequest, TokenRequestComposer, parseDuration } from '@protokol/ebsi-core';
import makeRequest from './makeRequest';
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK, MOCK_REQUESTED_TYPES } from './utils/mocks';
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { parseAuthorizeRequestSigned } from './utils/parseAuthorizationRequest';
import { parseAuthorizationResponse } from './utils/parseAuthorizationResponse';
import { IssuerService } from './issuerService';
import { AuthService } from './authService';

const issuerUrl = 'http://localhost:3000';
const issuerService = new IssuerService();
const authService = new AuthService();

const main = async () => {
    console.log("Holder wallet 0.1")
    console.log('-----------------------------------')

    // The Credentials that the user is hoing to request in this case is VerifiableCredential, specificly UniversityDegreeCredential
    const requestedCredentials = ["VerifiableCredential", "UniversityDegreeCredential"]

    // Discover issuer metadata
    console.log('Discovering issuer metadata...');
    const openIdMetadata = await issuerService.discoverConfigurationMetadata(issuerUrl);
    const openIdIssuer = await issuerService.discoverIssuerMetadata(issuerUrl);
    console.log('Discovered Issuer:', openIdIssuer.credential_issuer);
    console.log('Issuer metadata discovered:', openIdIssuer);
    console.log('Issuer config discovered:', openIdIssuer);
    console.log('-----------------------------------')

    // Authenticate with the issuer
    console.log('Athenticating client...');
    const token = await authService.authenticateWithIssuer(openIdIssuer, openIdMetadata, requestedCredentials, MOCK_DID_KEY);
    console.log('Authenticated with issuer:', token);

    // Request credential
    console.log('Requesting credential...');
    const credential = await issuerService.requestCredential(openIdIssuer, requestedCredentials, token.access_token, token.c_nonce);
    console.log({ credential })

    if (credential.acceptance_token) {
        console.log('Deferred token received, processing...');
        let deferredResponse;
        do {
            deferredResponse = await issuerService.deferredCredentialEndpoint(openIdIssuer.deferred_credential_endpoint, credential.acceptance_token);
            // console.log('Deferred response:', deferredResponse);
            if (!deferredResponse.credential) {
                console.log('Credential is still pending, waiting before retrying...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        } while (!deferredResponse.credential);
        console.log('Final deferred credential:', deferredResponse);
    }
    console.log('\n\n')
}

main();