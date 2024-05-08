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
    const issuerMetadata = await issuerService.discoverIssuerMetadata(issuerUrl);
    const configMetadata = await issuerService.discoverConfigurationMetadata(issuerUrl);
    console.log('Discovered Issuer:', issuerMetadata.credential_issuer);
    console.log('Issuer metadata discovered:', issuerMetadata);
    console.log('Issuer config discovered:', configMetadata);
    console.log('-----------------------------------')

    // Authenticate with the issuer
    console.log('Athenticating client...');
    const token = await authService.authenticateWithIssuer(issuerMetadata, configMetadata, requestedCredentials, MOCK_DID_KEY);
    console.log('Authenticated with issuer:', token);

    // Request credential
    // console.log('Requesting credential...');
    // const credential = await issuerService.requestCredential(issuerMetadata, requestedCredentials, token.access_token, token.c_nonce);
    // console.log({ credential })

    console.log('\n\n')
}

main();