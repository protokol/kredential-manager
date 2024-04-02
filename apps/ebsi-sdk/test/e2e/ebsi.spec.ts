import { Ebsi } from "../../src/Ebsi";

const RPC_URL = 'https://api.eu-dev.protokol.sh/rpc'
describe('Ebsi SDK E2E Tests', () => {
    let ebsi: Ebsi;

    beforeAll(() => {
        ebsi = new Ebsi(RPC_URL);
    });

    it('should create a DID successfully', async () => {
        const did = await ebsi.createDid();
        console.log({ did })
        expect(did).toBeDefined();
        expect(did).toMatch(/^did:ebsi:/);
    });
});