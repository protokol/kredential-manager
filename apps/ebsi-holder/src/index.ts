import { AuthRequestComposer, ClientMetadata, ResponseType } from '@protokol/ebsi-core';
import makeRequest from './makeRequest';
import { MOCK_DID_KEY } from './utils/mocks';

const issuerUrl = 'http://localhost:3000';

const main = async () => {
    console.log("Holder wallet 0.1")

    // In Time
    // Authorization Request
    const authRequest = AuthRequestComposer.holder(
        'code',
        MOCK_DID_KEY,
        'openid:', //callback
        { authorization_endpoint: 'openid:' },
        'test-code-challenge',
        'S256'
    );
    // Create the request URL
    const requestUrl = authRequest.setIssuerUrl(`${issuerUrl}/authorize`).createGetRequestUrl();
    // Make the request
    const data = await makeRequest(requestUrl, 'GET');

    // This is a deep link that needs to be handled in the holder wallet
    if (data && data.status === 302) {

        const location = data.headers.get('Location');
        const kid = data.headers.get('kid')
        const typ = data.headers.get('typ')
        const alg = data.headers.get('alg')

        console.log({ kid, typ, alg });
        console.log({ location });

        // TODO Check if the request was signed by the issuer, using the public key from the kid
    }
    console.log({ data });
}

main();