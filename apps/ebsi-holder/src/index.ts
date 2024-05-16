import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK } from './utils/mocks';
import { Holder } from '@probeta/mp-core';
import { log } from './utils/log';

const issuerUrl = 'http://localhost:3000';

const main = async () => {
    log('-----------------------------------')
    log("---------Holder wallet 0.2---------")
    log('-----------------------------------')

    const did = MOCK_DID_KEY
    const rp = new Holder(MOCK_DID_KEY_PRIVATE_KEY_JWK, did, issuerUrl)

    // Discover issuer and configuration metadata
    const openIdIssuer = await rp.discoverIssuerMetadata()
    const openIdMetadata = await rp.discoverConfigurationMetadata()
    log({ openIdIssuer })
    log({ openIdMetadata })

    // Authenticate with the issuer
    const requestedCredentials = ["VerifiableCredential", "UniversityDegreeCredential"];
    const accessToken = await rp.authenticateWithIssuer(openIdIssuer, openIdMetadata, requestedCredentials)

    // Request credential
    const credential = await rp.requestCredential(openIdIssuer, requestedCredentials, accessToken);
    if (credential.credential) {
        log('InTime Credential', credential.credential);
    } else if (credential.acceptance_token) {
        log('Deferred Credential')
        const deferredResponse = await rp.deferredCredentialEndpoint(openIdIssuer, credential.acceptance_token);
        log('Response:', deferredResponse);
    }
}

main();