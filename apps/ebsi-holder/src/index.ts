import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK } from './utils/mocks';
import { Holder } from '@probeta/mp-core';
import { log } from './utils/log';

const issuerUrl = 'http://localhost:3000';
// const issuerUrl = 'https://api.eu-dev.protokol.sh';

const main = async () => {
    log('-----------------------------------')
    log("---------Holder wallet 0.2---------")
    log('-----------------------------------')

    const did = MOCK_DID_KEY
    const hw = new Holder(MOCK_DID_KEY_PRIVATE_KEY_JWK, did, issuerUrl)

    // Discover issuer and configuration metadata
    const openIdIssuer = await hw.discoverIssuerMetadata()
    const openIdMetadata = await hw.discoverConfigurationMetadata()

    // Authenticate with the issuer
    const requestedCredentials = ["VerifiableCredential", "UniversityDegreeCredential"];
    const accessToken = await hw.authenticateWithIssuer(openIdIssuer, openIdMetadata, requestedCredentials)

    console.log({ accessToken })
    // Request credential
    const credential = await hw.requestCredential(openIdIssuer, requestedCredentials, accessToken);
    if (credential.credential) {
        log('InTime Credential', credential.credential);
    } else if (credential.acceptance_token) {
        log('Deferred Credential')
        const deferredResponse = await hw.deferredCredentialEndpoint(openIdIssuer, credential.acceptance_token);
        log('Response:', deferredResponse);
    }
}

main();