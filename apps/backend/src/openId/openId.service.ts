import { Injectable } from '@nestjs/common';
import { OpenIdProvider, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@probeta/mp-core';
import { EnterpriseJwtUtil } from '../issuer/jwt.util';


@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;
    private jwtUtil: EnterpriseJwtUtil;

    constructor() {
        const HOST = process.env.ISSUER_BASE_URL || 'localhost:3000';
        const privateKeyID = process.env.ISSUER_PRIVATE_KEY_ID;
        const issuerMetadata = getOpenIdIssuerMetadata(HOST);
        const configMetadata = getOpenIdConfigMetadata(HOST);
        const did = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU'
        const privateKeyJwk = {
            kty: 'EC',
            crv: 'P-256',
            x: 'NbkoaUnGy2ma932oIHHxmVr_m3uGeMO7DSJXbXEBAio',
            y: 'oonFfsV2IRHXoDq0_pvMfHScaKGUNKm5Y43ohxAaAK0',
            d: 'B8tLRpFVeS3qH2BfE2x5FC-gYr7kVmNrzi4icpPY2r0',
            kid: process.env.ISSUER_PRIVATE_KEY_ID
        }

        this.jwtUtil = new EnterpriseJwtUtil(privateKeyJwk);
        this.provider = new OpenIdProvider(issuerMetadata, configMetadata, privateKeyJwk, this.jwtUtil);
    }

    getInstance() {
        return this.provider;
    }
}