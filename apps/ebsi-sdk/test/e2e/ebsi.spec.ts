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

    it('should create a did:key for NATURAL_PERSON', async () => {
        const did = await ebsi.createNaturalPersonDid();
        expect(did).toBeDefined();
        expect(did).toMatch(/^did:key:/);
    });

    it('should create a did:key for NATURAL_PERSON from JWK', async () => {
        const did = await ebsi.createNaturalPersonDid(PUBLIC_KEY_JWK
        );
        expect(did).toBeDefined();
        expect(did).toMatch(/^did:key:/);
        expect(did).toMatch('did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbns7ZWNqwNNXRVtDg4wQYHxn2NGgqcTG5ehNhytKPrBdEw2mpy65bAdPKxFAZPbSTkLi6rPrkGjCXXTKz4hDvPBiWXHmR1CUgdJuXPjRn9S1ooLvYzKbv5P5zxMzzkEGiqJ');
    });


    // it('should create a did for LEGAL_ENTITY from private key', async () => {
    //     const did = await ebsi.createDid({
    //         type: 'LEGAL_ENTITY', options: PRIVATE_KEY
    //     }
    //     );
    //     expect(did).toBeDefined();
    //     expect(did).toMatch(/^did:ebsi:/);
    //     // expect(did).toMatch(/^did:ebsi:z268q7jnNhVf2842QpqXh7w5/);
    // });
});