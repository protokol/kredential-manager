import { Ebsi } from "../../src/Ebsi";

const RPC_URL = 'https://api.eu-dev.protokol.sh/rpc'

const PUBLIC_KEY_JWK = {
    "crv": "P-256",
    "kty": "EC",
    "x": "6jzanUIFb3QSjpzmiG8ZObdccfFC7vTzM6nN07b4p_g",
    "y": "IsX_xLJJItu52D-pzCBMB-C-DXexlXKj-YY-KEJ6oyk"
}

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
});