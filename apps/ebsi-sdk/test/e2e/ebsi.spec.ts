import { Ebsi } from "../../src/Ebsi";

const RPC_URL = 'https://api.eu-dev.protokol.sh/rpc'

const PUBLIC_KEY_JWK = {
    "crv": "P-256",
    "kty": "EC",
    "x": "6jzanUIFb3QSjpzmiG8ZObdccfFC7vTzM6nN07b4p_g",
    "y": "IsX_xLJJItu52D-pzCBMB-C-DXexlXKj-YY-KEJ6oyk"
}

const PRIVATE_KEY_HEX = "0xe75990c72548c68da2188b01e665ef4c411279260dcd2fc4107543b3220cf2cf"

describe('Ebsi SDK E2E Tests', () => {
    let ebsi: Ebsi;

    beforeAll(() => {
        ebsi = new Ebsi(RPC_URL);
    });

    it('should create a did:ebsi', async () => {
        const did = await ebsi.createLegalEntityDid();
        expect(did).toBeDefined();
        expect(did).toMatch(/^did:ebsi:/);
    });

    it('should create a did:key for NATURAL_PERSON from JWK', async () => {
        const did = await ebsi.createNaturalPersonDid(PUBLIC_KEY_JWK);
        expect(did).toBeDefined();
        expect(did).toMatch(/^did:key:/);
        expect(did).toMatch('did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbns7ZWNqwNNXRVtDg4wQYHxn2NGgqcTG5ehNhytKPrBdEw2mpy65bAdPKxFAZPbSTkLi6rPrkGjCXXTKz4hDvPBiWXHmR1CUgdJuXPjRn9S1ooLvYzKbv5P5zxMzzkEGiqJ');
    });

    it('should generate a key pair of type ES256K', async () => {
        const keyPair = await ebsi.generateKeyPair('ES256K');
        expect(keyPair.keyOptions.format).toBe('ES256K');
        expect(keyPair).toBeDefined();
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
    });

    it('should generate a key pair of type pem', async () => {
        const keyPair = await ebsi.generateKeyPair('pem');
        expect(keyPair).toBeDefined();
        expect(keyPair.keyOptions.format).toBe('pem');
        expect(keyPair.publicKey).toBeDefined();
        expect(keyPair.privateKey).toBeDefined();
    });

    it('should retrieve a public key from private key in jwk format', async () => {
        const publicKey = await ebsi.getPublicKey(PRIVATE_KEY_HEX, 'jwk');
        expect(publicKey).toBeDefined();
        expect(publicKey).toHaveProperty('x');
        expect(publicKey).toHaveProperty('y');
    });

    it('should retrieve a public key from private key in hex format', async () => {
        const publicKey = await ebsi.getPublicKey(PRIVATE_KEY_HEX, 'hex');
        expect(publicKey).toBeDefined();
        expect(publicKey).toEqual('04684e9b0ede8a5036b2fa1e78537f82398ff4fea0e29dfbb0a5fe25ae44f35e05b62496b3f915775011442e9e699dd2ef19a698a528a7b330d4c2486046c029fa');
    });

    it('should retrieve a public key from private key in pem format', async () => {
        const publicKey = await ebsi.getPublicKey(PRIVATE_KEY_HEX, 'pem');
        expect(publicKey).toBeDefined();
        expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
        expect(publicKey).toContain('-----END PUBLIC KEY-----');
    });

    it('should format a private key', async () => {
        const formattedPrivateKey = await ebsi.formatPrivateKey(PRIVATE_KEY_HEX, 'pem');
        expect(formattedPrivateKey).toBeDefined();
        expect(formattedPrivateKey).toContain('-----BEGIN EC PRIVATE KEY-----');
        expect(formattedPrivateKey).toContain('-----END EC PRIVATE KEY-----');
    });

    it('should retrieve the Ethereum address from a private key', async () => {
        const privateKey = '0xe75990c72548c68da2188b01e665ef4c411279260dcd2fc4107543b3220cf2cf';
        const ethereumAddress = await ebsi.getEthereumAddress(privateKey);
        expect(ethereumAddress).toBeDefined();
        expect(ethereumAddress).toMatch(/^[a-fA-F0-9]{40}$/);
    });

    it('should sign a JWT with a given private key', async () => {
        const payload = { data: 'exampleData' };
        const options = { issuer: 'exampleIssuer', expiresIn: 3600 };
        const header = { alg: 'ES256K' };
        const signedJwt = await ebsi.signJwt(PRIVATE_KEY_HEX, payload, options, header);
        expect(signedJwt).toBeDefined();
        expect(typeof signedJwt).toBe('string');
    });
});