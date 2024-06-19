import { generateCodeChallenge } from './utils/codeChallenge';
import { HolderJwtSigner } from './utils/jwt.util';
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK } from './utils/mocks';
import { Holder, generateRandomString } from '@probeta/mp-core';

const issuerUrl = 'https://api.eu-dev.protokol.sh';

const main = async () => {
  console.log('-----------------------------------');
  console.log('---------Holder wallet 0.2---------');
  console.log('-----------------------------------');

  const did = MOCK_DID_KEY;
  const singer = new HolderJwtSigner(MOCK_DID_KEY_PRIVATE_KEY_JWK);
  const hw = new Holder(MOCK_DID_KEY_PRIVATE_KEY_JWK, did, issuerUrl, singer);

  // Discover issuer and configuration metadata
  const openIdIssuer = await hw.discoverIssuerMetadata();
  const openIdMetadata = await hw.discoverConfigurationMetadata();
  console.log({ openIdIssuer })
  console.log({ openIdMetadata })
  // Authenticate with the issuer
  const requestedCredentials = [
    'VerifiableCredential',
    'UniversityDegreeCredential',
  ];

  const codeVerifier = generateRandomString(50);
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const accessToken = await hw.authenticateWithIssuer(
    openIdIssuer,
    openIdMetadata,
    requestedCredentials,
    codeVerifier,
    codeChallenge
  );

  // Request credential
  const credential = await hw.requestCredential(
    openIdIssuer,
    requestedCredentials,
    accessToken
  );
  if (credential.credential) {
    console.log('InTime Credential', credential.credential);
  } else if (credential.acceptance_token) {
    console.log('Deferred Credential');
    const deferredResponse = await hw.deferredCredentialEndpoint(
      openIdIssuer,
      credential.acceptance_token
    );
    console.log('Response:', deferredResponse);
  }
};

main();
