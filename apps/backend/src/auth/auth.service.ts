import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, IdTokenResponse, JwtHeader, OpenIdProvider, TokenRequestBody, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata } from '@protokol/ebsi-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { IdTokenResponseRequest } from '@protokol/ebsi-core/dist/OpenIdProvider/interfaces/id-token-response.interface';
import { mapHeadersToJwtHeader } from './auth.utils';
import { decodeJwt } from 'jose';
import { randomBytes } from 'crypto';
import { AuthNonce } from './../nonce/interfaces/auth-nonce.interface';
import { NonceStep } from './../nonce/enum/step.enum';
import { NonceStatus } from 'src/nonce/enum/status.enum';
@Injectable()
export class AuthService {

    constructor(private provider: OpenIDProviderService, private issuer: IssuerService, private nonce: NonceService) { }

    async authorize(request: AuthorizeRequest): Promise<{ header: JwtHeader, code: number, url: string }> {

        // Verify the authorization request and return the header, redirect URL, requested credentials and server defined state
        const { header, redirectUrl, authorizationDetails, serverDefinedState } = await this.provider.handleAuthorizationRequest(request)

        // Verify if the authorization details / requested credentials are supported by the issuer
        this.provider.verifyAuthorizationDetails(authorizationDetails)

        // Create a nonce for the client
        const noncePayload: AuthNonce = {
            authorizationDetails: authorizationDetails,
            redirectUri: request.redirect_uri,
            serverDefinedState: serverDefinedState,
            clientDefinedState: request.state,
            codeChallenge: request.code_challenge,
        }
        await this.nonce.createAuthNonce(request.client_id, request.nonce, noncePayload);
        return { header, code: 302, url: redirectUrl };
    }


    async directPost(request: IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header: JwtHeader, code: number, url: string }> {

        // Map headers to JWT header
        const header = await mapHeadersToJwtHeader(headers);
        const decodedRequest = await this.provider.decodeIdTokenRequest(request.id_token)

        // Get nonce => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonce(decodedRequest.nonce, NonceStep.AUTHORIZE, NonceStatus.UNCLAIMED, decodedRequest.iss);

        // The authz response must contain the client defined state send in the authorization
        const state = nonceData.payload.clientDefinedState;

        // Create a code for the client, 
        const code = randomBytes(50).toString("base64url");

        // Create/Update a nonce for the client, add code and id_token to the payload
        // On the token request, the client will send the code and the server will check if the code is valid and if the nonce is claimed
        await this.nonce.createAuthResponseNonce(decodedRequest.nonce, code, request.id_token);
        const redirectUrl = await this.provider.createAuthorizationRequest(code, state);
        return { header, code: 302, url: redirectUrl };
    }

    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {

        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Get nonce => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByCode(request.code, NonceStep.AUTH_RESPONSE, NonceStatus.UNCLAIMED, request.client_id);
        // Validate the code challenge that was send in the first auth request
        if (this.provider.validateCodeChallenge(nonceData.payload.codeChallenge, request.code_verifier) !== true) {
            throw new Error('Invalid code challenge.');
        }

        // Set idToken from the direct post call
        const idToken = nonceData.payload.idToken;
        const authDetails = nonceData.payload.authorizationDetails;
        const cNonce = randomBytes(25).toString("base64url");

        console.log('AAAA', cNonce)
        // Create/Update a nonce for the client, add cNonce
        await this.nonce.createTokenRequestCNonce(nonceData.nonce, cNonce);
        const response = await this.provider.composeTokenResponse(idToken, cNonce, authDetails);

        return { header, code: 200, response };
    }

    async credentail(request: any): Promise<{ header: any, code: number, response: any }> {

        // Decode request payload
        const decodedRequest = await this.provider.decodeCredentialRequest(request)
        // Get nonce by cNonce parameter => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByCNonce(decodedRequest.nonce, NonceStep.TOKEN_REQUEST, NonceStatus.UNCLAIMED, request.client_id);

        if (decodedRequest.iss !== nonceData.clientId) {
            throw new Error('Invalid issuer');
        }

        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://www.w3.org/2018/credentials/examples/v1"
            ],
            "type": ["VerifiableCredential", "UniversityDegreeCredential"],
            "credentialSubject": {
                "id": "did:key:ebfeb1f712ebc6f1c276e12ec21",
                "degree": {
                    "type": "BachelorDegree",
                    "name": "Bachelor of Science in Computer Science",
                    "degreeType": "Undergraduate",
                    "degreeSchool": "Best University",
                    "degreeDate": "2023-04-18"
                }
            }
        }
        const response = await this.provider.composeCredentialResponse('jwt_vc', 'cnonce', credential);
        return { header, code: 200, response };
    }
}