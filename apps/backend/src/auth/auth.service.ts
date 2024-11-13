import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, JHeader, TokenRequestBody, IdTokenResponseRequest, generateRandomString } from '@protokol/kredential-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { extractBearerToken } from './auth.utils';
import { AuthNonce } from './../nonce/interfaces/auth-nonce.interface';
import { NonceStep } from './../nonce/enum/step.enum';
import { NonceStatus } from './../nonce/enum/status.enum';
import { VcService } from './../vc/vc.service';
import { DidService } from './../student/did.service';
import { VCStatus } from './../types/VC';
import { validateCodeChallenge } from './../issuer/hash.util';
import { ResolverService } from './../resolver/resolver.service';
import { StateService } from './../state/state.service';
import { StateStep } from './../state/enum/step.enum';
import { StateStatus } from './../state/enum/status.enum';

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const MOCK_EBSI_PRE_AUTHORISED_DID = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kboj7g9PfXJxbbs4KYegyr7ELnFVnpDMzbJJDDNZjavX6jvtDmALMbXAGW67pdTgFea2FrGGSFs8Ejxi96oFLGHcL4P6bjLDPBJEvRRHSrG4LsPne52fczt2MWjHLLJBvhAC';
const MOCK_EBSI_PRE_AUTHORISED_IN_TIME_CREDENTIALS = ['CTWalletSamePreAuthorisedInTime'];
const MOCK_EBSI_PRE_AUTHORISED_DEFERRED_CREDENTIALS = ['CTWalletSamePreAuthorisedDeferred'];
const MOCK_EBSI_PRE_AUTHORISED_PIN_CODE = '1234';
const MOCK_EBSI_PRE_AUTHORISED_CODE = 'conformance';
interface PreAuthorisedCode {
    code: string;
    pinCode: string;
    userDid: string;
    isUsed: boolean;
}

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
        private state: StateService,
        private vcService: VcService,
        private didService: DidService,
        private resolverService: ResolverService
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
    async authorize(request: AuthorizeRequest): Promise<{ header?: JHeader, code: number, url?: string }> {
        try {

            if (!request.response_type || !request.client_id) {
                throw new Error('Missing required parameters');
            }

            const redirectUri = `${process.env.ISSUER_BASE_URL}/direct_post`


            const isIDTokenTest = request.scope?.includes('ver_test:id_token');

            let presentationDefinition;
            if (isIDTokenTest) {
                presentationDefinition = {
                    id: generateRandomString(32),
                    format: {
                        jwt_vp: { alg: ['ES256'] },
                        jwt_vc: { alg: ['ES256'] }
                    },
                    input_descriptors: [
                        // Three identical descriptors as per EBSI conformance
                        ...Array(3).fill({
                            id: generateRandomString(32),
                            format: {
                                jwt_vc: { alg: ['ES256'] }
                            },
                            constraints: {
                                fields: [{
                                    path: ['$.type'],
                                    filter: {
                                        type: 'array',
                                        contains: { const: 'VerifiableAttestation' }
                                    }
                                }]
                            }
                        })
                    ]
                };
            }
            const { header, redirectUrl, authDetails, serverDefinedState, serverDefinedNonce } = await this.provider.getInstance().handleAuthorizationRequest(request, redirectUri, presentationDefinition);

            const payload = {
                authorizationDetails: authDetails,
            }
            await this.state.createAuthState(request.client_id, request.code_challenge, request.code_challenge_method, request.redirect_uri, request.scope, request.response_type, serverDefinedState, serverDefinedNonce, request.state, request.nonce, payload)
            return { header, code: 302, url: redirectUrl };
        } catch (error) {
            throw error
        }
    }

    /**
     * Directly posts the ID token response after mapping headers to JWT header.
     * @param request The ID token response request object.
     * @param headers Headers record to map to JWT header.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async directPost(request: IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header?: JHeader, code: number, url?: string }> {
        try {
            console.log("Direct post:")
            const { payload, header } = await this.provider.getInstance().decodeIdTokenResponse(request.id_token);
            // Extract the state from the request or payload. * The documentations says that state should be send in payload, but the conformance test is sending it in the request.
            console.log({ ID_TOKEN_RESPONSE: payload })
            console.log({ ID_TOKEN_RESPONSE_RAW: request })
            const state = payload.state ?? request.state
            if (!state) {
                throw new Error('Missing state parameter');
            }
            // Extract the issuer from the payload or header.
            let issuer = ''
            if (payload.iss && payload.iss.startsWith("did:")) {
                issuer = payload.iss;
            } else if (header.kid && header.kid.startsWith("did:")) {
                issuer = header.kid.trim().split("#")[0];
            }

            const resolvedPublicKeysFromDid = await this.resolverService.resolveDID(issuer)
            if (!resolvedPublicKeysFromDid) {
                throw new Error('Failed to resolve DID');
            }

            // Verify the request.
            await this.issuer.verifyJWT(request.id_token, resolvedPublicKeysFromDid, issuer, header.alg)
            const stateData = await this.state.getByField('serverDefinedState', state, StateStep.AUTHORIZE, StateStatus.UNCLAIMED, issuer);

            // Generate a unique code for the client.
            const code = generateRandomString(25);
            // Extract the client-defined state from the authorization response.
            const walletDefinedState = stateData.walletDefinedState;
            const redirectUri = stateData.redirectUri ?? 'openid://';

            // Update the state for the client, including the generated code and ID token.
            await this.state.createAuthResponseNonce(stateData.id, code, request.id_token);
            const redirectUrl = await this.provider.getInstance().createAuthorizationRequest(code, walletDefinedState, redirectUri);
            return { header, code: 302, url: redirectUrl };
        } catch (error) {
            throw error
        }
    }

    /**
     * Processes the token request by validating the code challenge and composing the token response.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        try {
            if (request.grant_type === 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
                return await this.handlePreAuthorizedCode(request);
            }

            return await this.handleStandardTokenRequest(request);
        } catch (error) {
            return { header: this.header, code: 400, response: error.message };
        }
    }

    /**
     * Handles the pre-authorized code token request.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    private async handlePreAuthorizedCode(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        const pinCode = request.user_pin;
        const preAuthorisedCode = request['pre-authorized_code'];

        if (!pinCode || !preAuthorisedCode) {
            throw new Error('Missing user pin or pre-authorized code');
        }
        // ******************
        // CONFORMANCE TEST
        // ******************
        if (pinCode === MOCK_EBSI_PRE_AUTHORISED_PIN_CODE && preAuthorisedCode.startsWith(MOCK_EBSI_PRE_AUTHORISED_CODE)) {
            await this.state.deleteByPreAuthorisedAndPinCode(pinCode, preAuthorisedCode);
            if (preAuthorisedCode.startsWith(`${MOCK_EBSI_PRE_AUTHORISED_CODE}InTime`)) {
                await this.state.createPreAuthorisedAndPinCode(pinCode, preAuthorisedCode, MOCK_EBSI_PRE_AUTHORISED_DID, MOCK_EBSI_PRE_AUTHORISED_IN_TIME_CREDENTIALS);
            } else if (preAuthorisedCode.startsWith(`${MOCK_EBSI_PRE_AUTHORISED_CODE}Deferred`)) {
                await this.state.createPreAuthorisedAndPinCode(pinCode, preAuthorisedCode, MOCK_EBSI_PRE_AUTHORISED_DID, MOCK_EBSI_PRE_AUTHORISED_DEFERRED_CREDENTIALS);
            } else {
                throw new Error('Invalid pre-authorised code');
            }

        }
        // ******************

        await this.offerPreAuthorisedCredential(pinCode, preAuthorisedCode);

        const stateData = await this.state.getByPreAuthorisedAndPinCode(pinCode, preAuthorisedCode);
        const idToken = "";
        const authDetails = [];
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60; // seconds

        await this.state.createTokenRequestCNonce(stateData.id, cNonce, cNonceExpiresIn);
        const response = await this.provider.getInstance().composeTokenResponse(idToken, cNonce, cNonceExpiresIn, authDetails);
        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the standard token request.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    private async handleStandardTokenRequest(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        const stateData = await this.state.getByField('code', request.code, StateStep.AUTH_RESPONSE, StateStatus.UNCLAIMED, request.client_id);

        const isCodeChallengeValid = await validateCodeChallenge(stateData.codeChallenge, request.code_verifier);
        if (!isCodeChallengeValid) {
            throw new Error('Invalid code challenge.');
        }

        const idToken = stateData.payload.idToken;
        const authDetails = stateData.payload.authorizationDetails;
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60; // seconds

        await this.state.createTokenRequestCNonce(stateData.id, cNonce, cNonceExpiresIn);
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
        try {
            // Decode the request payload to retrieve the nonce and other details.
            const decodedRequest = await this.provider.getInstance().decodeCredentialRequest(request);
            const cNonce = decodedRequest.nonce;
            // Retrieve the nonce data associated with the cNonce to ensure it exists and is unclaimed.
            const stateData = await this.state.getByField('cNonce', cNonce, StateStep.TOKEN_REQUEST, StateStatus.UNCLAIMED, request.client_id);

            // Validate the issuer of the request against the stored nonce data.
            if (decodedRequest.iss !== stateData.clientId) {
                throw new Error('Invalid issuer');
            }

            // Extract the requested credentials from the nonce payload.
            const requestedCredentials = stateData.payload.authorizationDetails[0].types;
            // Retrieve the DID of the client from the nonce data.
            const did = stateData.clientId;

            // Create the verifiable credential.
            let vcId = await this.handleCredentialCreation(did, requestedCredentials);
            // Compose the deferred credential response.
            const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS
            const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS

            // ******************
            // CONFORMANCE TEST
            // ******************
            // If CTWalletSameAuthorisedInTime or CTWalletSameAuthorisedDeferred
            if (requestedCredentials.includes('CTWalletSameAuthorisedInTime') || requestedCredentials.includes('CTWalletSameAuthorisedDeferred') ||
                requestedCredentials.includes('CTWalletSamePreAuthorisedInTime') || requestedCredentials.includes('CTWalletSamePreAuthorisedDeferred')) {

                // Issue the verifiable credential
                const signedCredential = await this.vcService.CONFORMANCE_issueVerifiableCredential(vcId, requestedCredentials, stateData.clientId);
                if (!signedCredential) {
                    throw new Error('Failed to issue verifiable credential');
                }

                // If in time requested, return the in time response
                if (requestedCredentials.includes('CTWalletSameAuthorisedInTime')) {
                    const inTimeCredentialResponse = await this.provider.getInstance().composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, signedCredential);
                    return { header: this.header, code: 200, response: inTimeCredentialResponse };
                }

                // If deferred requested, return the deferred response
                if (requestedCredentials.includes('CTWalletSameAuthorisedDeferred')) {
                    const deferredCredentialResponse = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);
                    return { header: this.header, code: 200, response: deferredCredentialResponse };
                }
            }
            // ******************
            // END CONFORMANCE TEST
            // ******************

            // Otherwise, compose the deferred credential response
            const response = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);
            // Update the state for the client, including the acceptance token.
            await this.state.createDeferredResoponse(stateData.id, response.acceptance_token);

            return { header: this.header, code: 200, response };
        } catch (error) {
            return { header: this.header, code: 400, response: 'Invalid request' };
        }
    }

    /**
     * Handles the processing of a deferred credential response.
     * @param request The request object containing the acceptance token and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentilDeferred(body: any, headers: any): Promise<{ header: any, code: number, response: any }> {
        // Check if the request headers are defined
        if (!headers) {
            return { header: this.header, code: 400, response: 'Missing request headers' };
        }
        // Check if the Authorization header is present
        if (!headers['Authorization'] && !headers['authorization']) {
            return { header: this.header, code: 400, response: 'Missing Authorization header' };
        }
        // Extract the bearer token from the request headers.
        const acceptanceToken = extractBearerToken(headers);
        // Decode the acceptance token to validate its contents.
        const { header, payload } = await this.issuer.verifyBearerToken(acceptanceToken);
        const bearerPayload = payload as unknown as { vcId: number };
        // Validate the decoded acceptance token.
        if (!payload || !bearerPayload.vcId) {
            return { header: this.header, code: 400, response: 'Invalid acceptance token' };
        }
        // Retrieve the credential by its ID.
        const credential = await this.vcService.findOne(bearerPayload.vcId);
        if (!credential) {
            return { header: this.header, code: 500, response: 'Credential not found' };
        }
        // Determine the response based on the credential's status.
        switch (credential.status) {
            case VCStatus.ISSUED:
                const cNonce = generateRandomString(25);
                const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS // TODO: Update!!!
                const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS
                const response = await this.provider.getInstance().composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, credential.credential_signed);
                return { header: this.header, code: 200, response: response };
            case VCStatus.PENDING:
                return { header: this.header, code: 202, response: 'Credential status: pending' };
            case VCStatus.REJECTED:
                return { header: this.header, code: 403, response: 'Credential status: rejected' };
            default:
                return { header: this.header, code: 500, response: 'Credential not found' };
        }
    }

    /**
 * Handles the credential offering process.
 * @param pinCode The pin-code entered by the user.
 * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
 * @returns A promise resolving to an object containing the status and any additional information.
 */
    async offerPreAuthorisedCredential(pinCode: string, preAuthorisedCode: string) {
        try {
            // Validate the pin-code and pre-authorised code
            const isValid = await this.validatePreAuthorisedCode(pinCode, preAuthorisedCode);
            if (!isValid) {
                throw new Error('Invalid pin-code or pre-authorised code');
            }

            // Initiate the credential issuance process
            await this.issuePreAuthorisedCredential(pinCode, preAuthorisedCode);

        } catch (error) {
            console.error(error);
            throw error
        }
    }

    /**
    * Validates the pre-authorised code and pin-code.
    * @param pinCode The pin-code entered by the user.
    * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
    * @returns A promise resolving to a boolean indicating whether the validation was successful.
    */
    private async validatePreAuthorisedCode(pinCode: string, preAuthorisedCode: string): Promise<boolean> {
        return this.state.validatePreAuthorisedAndPinCode(pinCode, preAuthorisedCode);
    }

    /**
     * Issues the CTWalletSamePreAuthorisedInTime credential synchronously.
     * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
     * @returns A promise resolving to an object containing the issued credential.
     */
    async issuePreAuthorisedCredential(pinCode: string, preAuthorisedCode: string) {
        try {

            const state = await this.state.getByPreAuthorisedAndPinCode(pinCode, preAuthorisedCode);

            if (!state || !state.clientId || state.preAuthorisedCodeIsUsed) {
                throw new Error('Invalid pre-authorised code');
            }
            // Retrieve the DID of the user from the pre-authorised code
            const did = state.clientId;
            // Define the requested credentials
            const requestedCredentials = state?.payload?.authorizationDetails?.[0]?.types ?? [];
            if (requestedCredentials.length === 0) {
                throw new Error('No requested credentials in state');
            }
            // Create the verifiable credential
            const vcId = await this.handleCredentialCreation(did, requestedCredentials);
            // If not mock, issue the verifiable credential
            // For the conformance test, we issue the verifiable credential else where
            if (!preAuthorisedCode.startsWith(MOCK_EBSI_PRE_AUTHORISED_CODE)) {
                await this.vcService.issueVerifiableCredential(vcId);
            }

        } catch (error) {
            console.error("IssuePreAuthorisedCredential:", error);
            throw error;
        }
    }
}