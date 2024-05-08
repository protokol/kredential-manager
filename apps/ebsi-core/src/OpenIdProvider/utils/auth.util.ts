import { randomBytes } from 'crypto';
// import { parseDuration } from '../Global/utility';
// import { JwtHeader } from './types';
import { AuthorizeRequestSigned } from '../interfaces/authorize-request.interface';

// export function parseAuthorizationDetails(details: string | object): any[] {
//     return JSON.parse(typeof details === 'string' ? details : '[]');
// }

// export function generateServerDefinedState(): string {
//     return randomBytes(20).toString("base64url");
// }

// export function createJwtHeader(privateKey: JWK): JwtHeader {
//     return {
//         typ: 'JWT',
//         alg: 'ES256',
//         kid: privateKey.kid ?? ''
//     };
// }

// export function createIdTokenRequestPayload(verifiedRequest: AuthorizeRequestSigned, serverDefinedState: string): IdTokenRequest {
//     return {
//         iss: verifiedRequest.issuer,
//         aud: verifiedRequest.client_id,
//         exp: Math.floor(Date.now() / 1000) + parseDuration('10m'),
//         response_type: 'id_token',
//         response_mode: 'direct_post',
//         client_id: verifiedRequest.client_id,
//         redirect_uri: verifiedRequest.redirect_uri,
//         scope: 'openid',
//         state: serverDefinedState,
//         nonce: verifiedRequest.nonce ?? ''
//     };
// }