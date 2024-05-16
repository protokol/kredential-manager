import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, IdTokenResponse, JwtHeader, JwtSigner, OpenIdProvider, TokenRequestBody, generateDidFromPrivateKey, getOpenIdConfigMetadata, getOpenIdIssuerMetadata, jwtDecode, jwtDecodeUrl, parseDuration } from '@probeta/mp-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { IdTokenResponseRequest } from '@probeta/mp-core/dist/OpenIdProvider/interfaces/id-token-response.interface';
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
import { VCStatus } from 'src/types/VC';
@Injectable()
export class AuthService {

    // Represents the header configuration used across various HTTP requests.
    private header = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    /**
     * Constructor initializes the service with necessary dependencies.
     * @param provider An instance of OpenIDProviderService for handling OAuth flows.
     * @param issuer An instance of IssuerService for issuing tokens.
     * @param nonce An instance of NonceService for managing nonces.
     * @param vcService An instance of VcService for creating and managing verifiable credentials.
     * @param studentService An instance of StudentService for handling student-related operations.
     * @param didService An instance of DidService for managing Decentralized Identifiers (DIDs).
     */
    constructor(
        private provider: OpenIDProviderService,
        private issuer: IssuerService,
        private nonce: NonceService,
        private vcService: VcService,
        private studentService: StudentService,
        private didService: DidService
    ) { }

    /**
     * Creates or retrieves a DID entity based on the provided DID, then creates a verifiable credential.
     * @param did The Decentralized Identifier (DID) for which the credential is being created.
     * @param requestedCredentials The list of credentials to be included in the verifiable credential.
     * @returns A promise resolving to the ID of the newly created verifiable credential.
     */
    private async handleCredentialCreation(did: string, requestedCredentials: any[]): Promise<number> {
        // Attempt to find an existing DID entity by the provided DID.
        let didEntity = await this.didService.findByDid(did);

        // If no DID entity is found, create a new one.
        if (!didEntity) {
            didEntity = await this.didService.create({ identifier: did });
        }

        // Create a new verifiable credential with the specified DID entity and requested credentials.
        const newVc = await this.vcService.create({
            did: didEntity,
            requested_credentials: requestedCredentials,
            type: "UniversityDegreeCredential001" // Placeholder type, replace with actual type when finalized.
        });

        // Return the ID of the newly created verifiable credential.
        return newVc.id;
    }

    /**
     * Handles the authorization process.
     * @param request The authorization request object containing necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async authorize(request: AuthorizeRequest): Promise<{ header: JwtHeader, code: number, url: string }> {
        // Verify the authorization request and return the header, redirect URL, requested credentials, and server-defined state.
        const { header, redirectUrl, authDetails, serverDefinedState } = await this.provider.getInstance().handleAuthorizationRequest(request);

        // Create a nonce for the client.
        const noncePayload: AuthNonce = {
            authorizationDetails: authDetails,
            redirectUri: request.redirect_uri,
            serverDefinedState: serverDefinedState,
            clientDefinedState: request.state,
            codeChallenge: request.code_challenge,
        };
        await this.nonce.createAuthNonce(request.client_id, request.nonce, noncePayload);
        return { header, code: 302, url: redirectUrl };
    }

    /**
     * Directly posts the ID token response after mapping headers to JWT header.
     * @param request The ID token response request object.
     * @param headers Headers record to map to JWT header.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async directPost(request: IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header: JwtHeader, code: number, url: string }> {
        // Map headers to JWT header.
        const header = await mapHeadersToJwtHeader(headers);
        const decodedRequest = await this.provider.getInstance().decodeIdTokenRequest(request.id_token);

        // Retrieve the nonce data to ensure it exists and is unclaimed.
        const nonceData = await this.nonce.getNonceByField('nonce', decodedRequest.nonce, NonceStep.AUTHORIZE, NonceStatus.UNCLAIMED, decodedRequest.iss);

        // Extract the client-defined state from the authorization response.
        const state = nonceData.payload.clientDefinedState;

        // Generate a unique code for the client.
        const code = randomBytes(50).toString("base64url");

        // Update the nonce for the client, including the generated code and ID token.
        await this.nonce.createAuthResponseNonce(decodedRequest.nonce, code, request.id_token);
        const redirectUrl = await this.provider.getInstance().createAuthorizationRequest(code, state);
        return { header, code: 302, url: redirectUrl };
    }

    /**
     * Processes the token request by validating the code challenge and composing the token response.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        // Retrieve the nonce data to ensure it exists and is unclaimed.
        const nonceData = await this.nonce.getNonceByField('code', request.code, NonceStep.AUTH_RESPONSE, NonceStatus.UNCLAIMED, request.client_id);

        // Validate the code challenge against the one sent in the initial auth request.
        if (this.provider.getInstance().validateCodeChallenge(nonceData.payload.codeChallenge, request.code_verifier) !== true) {
            throw new Error('Invalid code challenge.');
        }

        // Prepare the token response.
        const idToken = nonceData.payload.idToken;
        const authDetails = nonceData.payload.authorizationDetails;
        const cNonce = randomBytes(25).toString("base64url");
        const cNonceExpiresIn = 60 * 60; // seconds

        // Update the nonce for the client, including the cNonce.
        await this.nonce.createTokenRequestCNonce(nonceData.nonce, cNonce, cNonceExpiresIn);
        const response = await this.provider.getInstance().composeTokenResponse(idToken, cNonce, cNonceExpiresIn, authDetails);

        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the creation of a deferred credential response.
     * @param headers Request headers.
     * @param request The request object containing the nonce and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentail(request: any): Promise<{ header: any, code: number, response: any }> {
        // Decode the request payload to retrieve the nonce and other details.
        const decodedRequest = await this.provider.getInstance().decodeCredentialRequest(request);
        const cNonce = decodedRequest.nonce;

        // Retrieve the nonce data associated with the cNonce to ensure it exists and is unclaimed.
        const nonceData = await this.nonce.getNonceByField('cNonce', cNonce, NonceStep.TOKEN_REQUEST, NonceStatus.UNCLAIMED, request.client_id);

        // Validate the issuer of the request against the stored nonce data.
        if (decodedRequest.iss !== nonceData.clientId) {
            throw new Error('Invalid issuer');
        }

        // Extract the requested credentials from the nonce payload.
        const requestedCredentials = nonceData.payload.authorizationDetails[0].types;
        // Retrieve the DID of the client from the nonce data.
        const did = nonceData.clientId;

        // Create the verifiable credential.
        let vcId = await this.handleCredentialCreation(did, requestedCredentials);

        // Compose the deferred credential response.
        const cNonceExpiresIn = parseDuration('1h')
        const tokenExpiresIn = parseDuration('1h')
        const response = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);

        // Update the nonce for the client, including the acceptance token.
        await this.nonce.createDeferredResoponse(nonceData.nonce, response.acceptance_token);

        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the processing of a deferred credential response.
     * @param request The request object containing the acceptance token and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentilDeferred(request: any): Promise<{ header: any, code: number, response: any }> {
        // Extract the bearer token from the request headers.
        const acceptanceToken = extractBearerToken(request.headers);
        // Decode the acceptance token to validate its contents.
        const decodedAcceptanceToken = await this.issuer.decodeJWT(acceptanceToken) as any;

        // Validate the decoded acceptance token.
        if (!decodedAcceptanceToken || !decodedAcceptanceToken.vcId) {
            return { header: this.header, code: 400, response: 'Invalid acceptance token' };
        }
        // Retrieve the credential by its ID.
        const credential = await this.vcService.findOne(decodedAcceptanceToken.vcId);
        if (!credential) {
            return { header: this.header, code: 500, response: 'Credential not found' };
        }

        // Determine the response based on the credential's status.
        switch (credential.status) {
            case VCStatus.ISSUED:
                if (credential.credential_signed === '{}') {
                    const cNonce = randomBytes(25).toString("base64url");
                    const cNonceExpiresIn = parseDuration('1h')
                    const tokenExpiresIn = parseDuration('1h')
                    const response = await this.provider.getInstance().composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, credential.credential_signed);
                    return { header: this.header, code: 200, response: response };
                }
                return { header: this.header, code: 500, response: 'Credential not found' };
            case VCStatus.PENDING:
                return { header: this.header, code: 202, response: 'Credential status: pending' };
            case VCStatus.REJECTED:
                return { header: this.header, code: 403, response: 'Credential status: rejected' };
            default:
                return { header: this.header, code: 500, response: 'Credential not found' };
        }
    }
}