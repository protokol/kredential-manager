import { AuthRequestComposer, AuthorizationResponse, AuthorizeRequestSigned, ClientMetadata, IdTokenResponse, IdTokenResponseComposer, JwtHeader, ResponseType, TokenRequest, TokenRequestComposer, parseDuration } from '@protokol/ebsi-core';
import makeRequest from './makeRequest';
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK, MOCK_REQUESTED_TYPES } from './utils/mocks';
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { parseAuthorizeRequestSigned } from './utils/parseAuthorizationRequest';
import { parseAuthorizationResponse } from './utils/parseAuthorizationResponse';
import { IssuerService } from './issuerService';

const issuerUrl = 'http://localhost:3000';

const issuerService = new IssuerService();

const main = async () => {
    console.log("Holder wallet 0.1")

    // Discover issuer metadata
    console.log('Discovering issuer metadata...');
    const issuerMetadata = await issuerService.discoverIssuerMetadata(issuerUrl);
    const configMetadata = await issuerService.discoverConfigurationMetadata(issuerUrl);
    console.log('Issuer metadata discovered:', issuerMetadata);
    console.log('Issuer config discovered:', configMetadata);

    console.log('\n\n')
}

main();