import { generateCodeChallenge } from './utils/codeChallenge';
import { HolderJwtSigner } from './utils/jwt.util';
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK, MOCK_DID_KEY_PUBLIC_KEY_JWK } from './utils/mocks';
import { Holder, generateRandomString } from '@probeta/mp-core';

// const issuerUrl = 'https://api.eu-dev.protokol.sh';
const issuerUrl = 'http://localhost:3000';

const main = async () => {
  console.log('-----------------------------------');
  console.log('---------Holder wallet 0.2---------');
  console.log('-----------------------------------');


  const did = MOCK_DID_KEY;
  const signer = new HolderJwtSigner(MOCK_DID_KEY_PRIVATE_KEY_JWK, did);
  const hw = new Holder(MOCK_DID_KEY_PRIVATE_KEY_JWK, did, issuerUrl, signer);

  // Discover issuer and configuration metadata
  const openIdIssuer = await hw.discoverIssuerMetadata();
  const openIdMetadata = await hw.discoverConfigurationMetadata();

  const requestedCredentials = [
    "VerifiableCredential",
    "VerifiableAttestation",
    "CTWalletSameAuthorisedDeferred"
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
