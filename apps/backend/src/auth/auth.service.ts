import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, IdTokenResponse, JwtHeader, JwtSigner, OpenIdProvider, TokenRequestBody, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata, jwtDecode, jwtDecodeUrl } from '@protokol/ebsi-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { IdTokenResponseRequest } from '@protokol/ebsi-core/dist/OpenIdProvider/interfaces/id-token-response.interface';
import { extractBearerToken, mapHeadersToJwtHeader } from './auth.utils';
import { decodeJwt } from 'jose';
import { randomBytes } from 'crypto';
import { AuthNonce } from './../nonce/interfaces/auth-nonce.interface';
import { NonceStep } from './../nonce/enum/step.enum';
import { NonceStatus } from './../nonce/enum/status.enum';
import { VcService } from './../vc/vc.service';
import { StudentService } from './../student/student.service';
import { CreateStudentDto } from './../student/dto/create-student';
import { VerifiableCredential } from 'src/vc/entities/VerifiableCredential';
import { DidService } from 'src/student/did.service';
@Injectable()
export class AuthService {
    private header = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    constructor(private provider: OpenIDProviderService, private issuer: IssuerService, private nonce: NonceService, private vcService: VcService, private studentService: StudentService, private didService: DidService) { }

    async authorize(request: AuthorizeRequest): Promise<{ header: JwtHeader, code: number, url: string }> {

        // Verify the authorization request and return the header, redirect URL, requested credentials and server defined state
        const { header, redirectUrl, authDetails, serverDefinedState } = await this.provider.getInstance().handleAuthorizationRequest(request)

        // Create a nonce for the client
        const noncePayload: AuthNonce = {
            authorizationDetails: authDetails,
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
        const decodedRequest = await this.provider.getInstance().decodeIdTokenRequest(request.id_token)

        // Get nonce => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByField('nonce', decodedRequest.nonce, NonceStep.AUTHORIZE, NonceStatus.UNCLAIMED, decodedRequest.iss);

        // The authz response must contain the client defined state send in the authorization
        const state = nonceData.payload.clientDefinedState;

        // Create a code for the client, 
        const code = randomBytes(50).toString("base64url");

        // Create/Update a nonce for the client, add code and id_token to the payload
        // On the token request, the client will send the code and the server will check if the code is valid and if the nonce is claimed
        await this.nonce.createAuthResponseNonce(decodedRequest.nonce, code, request.id_token);
        const redirectUrl = await this.provider.getInstance().createAuthorizationRequest(code, state);
        return { header, code: 302, url: redirectUrl };
    }

    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {

        // Get nonce => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByField('code', request.code, NonceStep.AUTH_RESPONSE, NonceStatus.UNCLAIMED, request.client_id);
        // Validate the code challenge that was send in the first auth request
        if (this.provider.getInstance().validateCodeChallenge(nonceData.payload.codeChallenge, request.code_verifier) !== true) {
            throw new Error('Invalid code challenge.');
        }

        // Set idToken from the direct post call
        const idToken = nonceData.payload.idToken;
        const authDetails = nonceData.payload.authorizationDetails;
        const cNonce = randomBytes(25).toString("base64url");

        // Create/Update a nonce for the client, add cNonce
        await this.nonce.createTokenRequestCNonce(nonceData.nonce, cNonce);
        const response = await this.provider.getInstance().composeTokenResponse(idToken, cNonce, authDetails);

        return { header: this.header, code: 200, response };
    }

    async credentail(headers: any, request: any): Promise<{ header: any, code: number, response: any }> {


        // Decode request payload
        const decodedRequest = await this.provider.getInstance().decodeCredentialRequest(request)
        const cNonce = decodedRequest.nonce
        // Get nonce by cNonce parameter => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByField('cNonce', cNonce, NonceStep.TOKEN_REQUEST, NonceStatus.UNCLAIMED, request.client_id);

        if (decodedRequest.iss !== nonceData.clientId) {
            throw new Error('Invalid issuer');
        }

        // Take first requested credential, since this is not a batch request
        const requestedCredentials = nonceData.payload.authorizationDetails[0].types
        // Get the DID of the client
        const did = nonceData.clientId
        let vcId;


        const existingDid = await this.didService.findByDid(did)
        if (existingDid) {
            console.log({ existingDid })
            const newVc = await this.vcService.create({
                did: existingDid,
                requested_credentials: requestedCredentials,
                type: "UniversityDegreeCredential001", // TODO
            })
            vcId = newVc.id
        } else {
            const newDid = await this.didService.create({
                identifier: did
            })
            const newVc = await this.vcService.create({
                did: newDid,
                requested_credentials: requestedCredentials,
                type: "UniversityDegreeCredential001", // TODO
            })
            vcId = newVc.id
        }

        // Deferred response
        const response = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, vcId);
        // Create/Update a nonce for the client, add acceptanceToken
        await this.nonce.createDeferredResoponse(nonceData.nonce, response.acceptance_token);
        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        return { header, code: 200, response };
    }

    async credentilDeferred(request: any): Promise<{ header: any, code: number, response: any }> {

        const acceptanceToken = extractBearerToken(request.headers)

        // Get nonce by cNonce parameter => check if it exists and is unclaimed
        const nonceData = await this.nonce.getNonceByField('acceptanceToken', acceptanceToken, NonceStep.DEFERRED_REQUEST, NonceStatus.UNCLAIMED, request.client_id);
        if (!nonceData) {
            throw new Error('Invalid acceptance token');
        }

        const decodedAcceptanceToken = await this.issuer.decodeJWT(acceptanceToken) as any

        if (!decodedAcceptanceToken || !decodedAcceptanceToken.vcId) {
            throw new Error('Invalid acceptance token');
        }

        if (this.issuer.isJwtTokenExpired(decodedAcceptanceToken)) {
            return { header: this.header, code: 401, response: "" };
        }

        const credential = await this.vcService.findOne(decodedAcceptanceToken.vcId)

        if (!credential) {
            throw new Error('Credential not found');
        }

        if (credential.status === 'issued') {
            if (credential.credential_signed != '{}') {
                const cNonce = randomBytes(25).toString("base64url");
                const response = await this.provider.getInstance().composeInTimeCredentialResponse('jwt_vc', cNonce, credential.credential_signed);
                return { header: this.header, code: 200, response: response };

            }
        }

        return { header: this.header, code: 200, response: "" };
    }
}