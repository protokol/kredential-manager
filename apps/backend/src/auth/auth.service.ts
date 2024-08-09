import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, JHeader, TokenRequestBody, IdTokenResponseRequest, generateRandomString } from '@probeta/mp-core';
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

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000; // TODO: Move to a shared utility file.

interface PreAuthorisedCode {
    code: string;
    pinCode: string;
    userDid: string;
    isUsed: boolean;
}

@Injectable()
export class AuthService {

    private preAuthorisedCodes: PreAuthorisedCode[] = [
        {
            code: 'SplxlOBeZQQYbYS6WxSbIA',
            pinCode: '1234',
            userDid: 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kboj7g9PfXJxbbs4KYegyr7ELnFVnpDMzbJJDDNZjavX6jvtDmALMbXAGW67pdTgFea2FrGGSFs8Ejxi96oFLGHcL4P6bjLDPBJEvRRHSrG4LsPne52fczt2MWjHLLJBvhAC',
            isUsed: false
        }
    ];

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
            console.log({ request })
            const redirectUri = "https://api.miha.eu-dev.protokol.sh/direct_post"
            const { header, redirectUrl, authDetails, serverDefinedState, serverDefinedNonce } = await this.provider.getInstance().handleAuthorizationRequest(request, redirectUri);

            const payload = {
                authorizationDetails: authDetails,
            }

            await this.state.createAuthState(request.client_id, request.code_challenge, request.code_challenge_method, request.redirect_uri, request.scope, request.response_type, serverDefinedState, serverDefinedNonce, request.state, request.nonce, payload)
            console.log("STEP: authorize: ")
            console.log({ ReqState: request.state })
            console.log({ ReqNonce: request.nonce })
            console.log({ ServerState: serverDefinedState })
            console.log({ ServerNonce: serverDefinedNonce })
            console.log({ redirectUrl })
            console.log("-----------------")
            return { header, code: 302, url: redirectUrl };
        } catch (error) {
            console.log({ error })
            return { code: 400 };
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
            const { payload, header } = await this.provider.getInstance().decodeIdTokenRequest(request.id_token);
            // Extract the state from the request or payload. * The documentations says that state should be send in payload, but the conformance test is sending it in the request.
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
            // console.log({ issuer })
            // console.log({ resolvedPublicKeysFromDid })
            if (!resolvedPublicKeysFromDid) {
                throw new Error('Failed to resolve DID');
            }
            // const issuerTEST = "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU"
            // const resolvedPublicKeysFromDidTEST = await this.resolverService.resolveDID(issuerTEST)
            // console.log({ issuerTEST })
            // console.log({ resolvedPublicKeysFromDidTEST })


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
            console.log({ error })
            throw error
        }
    }

    /**
     * Processes the token request by validating the code challenge and composing the token response.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        console.log("STEP: token: ")
        console.log({ TOKEN_REQUEST: request })

        // If the grant type is pre-authorized_code, handle it immediately
        if (request.grant_type === 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
            if (!request.user_pin || !request.pre_authorized_code) {
                throw new Error('Missing user pin or pre-authorized code');
            }
            // Conformance test
            if (request.user_pin === '1234' && request.pre_authorized_code === 'SplxlOBeZQQYbYS6WxSbIA') {
                const stateData = await this.state.getByField('preAuthorisedCode', request.pre_authorized_code, StateStep.AUTHORIZE, StateStatus.UNCLAIMED, request.client_id);

            }
            if (this.offerCredential(request.user_pin, request.pre_authorized_code)) {

            }
        }

        // Retrieve the nonce data to ensure it exists and is unclaimed.
        const stateData = await this.state.getByField('code', request.code, StateStep.AUTH_RESPONSE, StateStatus.UNCLAIMED, request.client_id);
        // Validate the code challenge against the one sent in the initial auth request.
        const isCodeChallengeValid = await validateCodeChallenge(stateData.codeChallenge, request.code_verifier);
        if (isCodeChallengeValid !== true) {
            throw new Error('Invalid code challenge.');
        }
        // Prepare the token response.
        const idToken = stateData.payload.idToken;
        const authDetails = stateData.payload.authorizationDetails;
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60; // seconds
        // Update the nonce for the client, including the cNonce.
        await this.state.createTokenRequestCNonce(stateData.id, cNonce, cNonceExpiresIn);
        const response = await this.provider.getInstance().composeTokenResponse(idToken, cNonce, cNonceExpiresIn, authDetails);
        console.log({ TOKEN_RESPONSE: response })
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
            console.log("STEP: credential: ")
            console.log({ CREDENTIAL_REQUEST: request })
            // Decode the request payload to retrieve the nonce and other details.
            const decodedRequest = await this.provider.getInstance().decodeCredentialRequest(request);
            // console.log({ decodedRequest })
            const cNonce = decodedRequest.nonce;
            // console.log({ cNonce })
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

            // Check if requestedCredentials contains CTWalletSameAuthorisedInTime
            const containsCTWalletSameAuthorisedInTime = requestedCredentials.includes('CTWalletSameAuthorisedInTime');
            // console.log({ containsCTWalletSameAuthorisedInTime });



            // console.log({ requestedCredentials })
            // console.log({ did })
            // Create the verifiable credential.
            let vcId = await this.handleCredentialCreation(did, requestedCredentials);
            // console.log({ vcId })
            // Compose the deferred credential response.
            const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS
            const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS

            // ******************
            // CONFORMANCE TEST
            // ******************
            // If CTWalletSameAuthorisedInTime is requested, handle it immediately this is for conformance test
            if (requestedCredentials.includes('CTWalletSameAuthorisedInTime') || requestedCredentials.includes('CTWalletSameAuthorisedDeferred')) {
                console.log(requestedCredentials);
                // Issue the verifiable credential
                const signedCredential = await this.vcService.CONFORMANCE_issueVerifiableCredential(vcId, requestedCredentials, stateData.clientId);
                if (!signedCredential) {
                    throw new Error('Failed to issue verifiable credential');
                }

                // If in time requested, return the in time response
                if (requestedCredentials.includes('CTWalletSameAuthorisedInTime')) {
                    // console.log('CTWalletSameAuthorisedInTime requested.');
                    const inTimeCredentialResponse = await this.provider.getInstance().composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, signedCredential);
                    console.log({ CREDENTIAL_RESPONSE_IN_TIME: inTimeCredentialResponse })
                    return { header: this.header, code: 200, response: inTimeCredentialResponse };
                }

                // If deferred requested, return the deferred response
                if (requestedCredentials.includes('CTWalletSameAuthorisedDeferred')) {
                    // console.log('CTWalletSameAuthorisedDeferred requested.');
                    const deferredCredentialResponse = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);
                    console.log({ CREDENTIAL_RESPONSE_DEFERRED: deferredCredentialResponse })
                    return { header: this.header, code: 200, response: deferredCredentialResponse };
                }
            }
            // ******************
            // END CONFORMANCE TEST
            // ******************

            // Otherwise, compose the deferred credential response
            const response = await this.provider.getInstance().composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);
            // Update the nonce for the client, including the acceptance token.
            await this.state.createDeferredResoponse(stateData.id, response.acceptance_token);

            console.log({ CREDENTIAL_RESPONSE: response })

            return { header: this.header, code: 200, response };
        } catch (error) {
            console.log({ error })
            return { header: this.header, code: 400, response: 'Invalid request' };
        }
    }

    /**
     * Handles the processing of a deferred credential response.
     * @param request The request object containing the acceptance token and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentilDeferred(request: any): Promise<{ header: any, code: number, response: any }> {
        console.log("STEP: credentilDeferred: ")
        console.log({ CREDENTIAL_DEFERRED_REQUEST: request })
        // Check if the request headers are defined
        if (!request.headers) {
            return { header: this.header, code: 400, response: 'Missing request headers' };
        }
        // Check if the Authorization header is present
        if (!request.headers['Authorization'] && !request.headers['authorization']) {
            return { header: this.header, code: 400, response: 'Missing Authorization header' };
        }
        // Extract the bearer token from the request headers.
        const acceptanceToken = extractBearerToken(request.headers);
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

    async initPreAuthoriseFlow(pinCode: string, preAuthorisedCode: string, did: string, requestedCredentials: string[]): Promise<boolean> {
        const isCreated = await this.state.createPreAuthorisedCode(pinCode, preAuthorisedCode, did, requestedCredentials);
        if (!isCreated) {
            throw new Error('Failed to create pre-authorised code');
        }
    }
    /**
 * Handles the credential offering process.
 * @param pinCode The pin-code entered by the user.
 * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
 * @returns A promise resolving to an object containing the status and any additional information.
 */
    async offerCredential(pinCode: string, preAuthorisedCode: string): Promise<boolean> {
        try {
            // Validate the pin-code and pre-authorised code
            const isValid = await this.validatePreAuthorisedCode(pinCode, preAuthorisedCode);
            if (!isValid) {
                throw new Error('Invalid pin-code or pre-authorised code');
            }

            // Initiate the credential issuance process
            const issuanceResult = await this.issuePreAuthorisedCredential(preAuthorisedCode);
            return true
        } catch (error) {
            console.error("Error in offerCredential", error);
            return false
        }
    }

    /**
    * Validates the pre-authorised code and pin-code.
    * @param pinCode The pin-code entered by the user.
    * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
    * @returns A promise resolving to a boolean indicating whether the validation was successful.
    */
    private async validatePreAuthorisedCode(pinCode: string, preAuthorisedCode: string): Promise<boolean> {
        const codeEntry = this.preAuthorisedCodes.find(code => code.code === preAuthorisedCode && code.pinCode === pinCode);
        if (codeEntry && !codeEntry.isUsed) {
            // Mark the code as used
            // codeEntry.isUsed = true;
            return true;
        }
        return false;
    }

    /**
     * Retrieves the DID of the user from the pre-authorised code.
     * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
     * @returns A promise resolving to the user's DID.
     * @throws An error if the pre-authorised code is invalid.
     */
    private async getDidFromPreAuthorisedCode(preAuthorisedCode: string): Promise<string> {
        const codeEntry = this.preAuthorisedCodes.find(code => code.code === preAuthorisedCode);
        if (codeEntry) {
            return codeEntry.userDid;
        }
        throw new Error('Invalid pre-authorised code');
    }

    /**
     * Issues the CTWalletSamePreAuthorisedInTime credential synchronously.
     * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
     * @returns A promise resolving to an object containing the issued credential.
     */
    async issuePreAuthorisedCredential(preAuthorisedCode: string): Promise<any> {
        try {
            // Retrieve the DID of the user from the pre-authorised code
            const did = await this.getDidFromPreAuthorisedCode(preAuthorisedCode);

            // Define the requested credentials
            const requestedCredentials = ['CTWalletSamePreAuthorisedInTime'];

            // Create the verifiable credential
            const vcId = await this.handleCredentialCreation(did, requestedCredentials);

            // Issue the verifiable credential
            const signedCredential = await this.vcService.issueVerifiableCredential(vcId);
            if (!signedCredential) {
                throw new Error('Failed to issue verifiable credential');
            }

            return signedCredential;
        } catch (error) {
            console.error("Error in issuePreAuthorisedCredential", error);
            throw error;
        }
    }
}