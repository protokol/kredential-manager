import {
    verifyCredentialJwt,
} from "@cef-ebsi/verifiable-credential";
import { Injectable } from '@nestjs/common';
import { AuthorizeRequest, JHeader, TokenRequestBody, IdTokenResponseRequest, generateRandomString, VPPayload, JWT, VCJWT } from '@protokol/kredential-core';
import { OpenIDProviderService } from './../openId/openId.service';
import { IssuerService } from './../issuer/issuer.service';
import { NonceService } from './../nonce/nonce.service';
import { extractBearerToken, arraysAreEqual } from './auth.utils';
import { VcService } from './../vc/vc.service';
import { DidService } from './../student/did.service';
import { VCStatus } from './../types/VC';
import { validateCodeChallenge } from './../issuer/hash.util';
import { ResolverService } from './../resolver/resolver.service';
import { StateService } from './../state/state.service';
import { StateStep } from './../state/enum/step.enum';
import { StateStatus } from './../state/enum/status.enum';
import { EbsiNetwork } from "src/network/ebsi-network.types";
import { Did } from "@entities/did.entity";
import { CredentialOfferService } from "src/credential-offer/credential-offer.service";
import { GrantType } from "src/credential-offer/credential-offer.type";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { CredentialOffer } from "@entities/credential-offer.entity";
import { handleError } from "src/error/ebsi-error.util";
import { createError, EbsiError, ERROR_CODES } from "src/error/ebsi-error";
import { VpService } from "src/vp/vp.service";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { CredentialOfferData } from "@entities/credential-offer-data.entity";
import { State } from "@entities/state.entity";
import { StudentService } from "src/student/student.service";
import { CreateStudentDto } from "src/student/dto/create-student";
import { SchemaTemplateData } from "src/schemas/schema.types";

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const MOCK_EBSI_PRE_AUTHORISED_DID = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kboj7g9PfXJxbbs4KYegyr7ELnFVnpDMzbJJDDNZjavX6jvtDmALMbXAGW67pdTgFea2FrGGSFs8Ejxi96oFLGHcL4P6bjLDPBJEvRRHSrG4LsPne52fczt2MWjHLLJBvhAC';
const MOCK_EBSI_PRE_AUTHORISED_IN_TIME_CREDENTIALS = ['CTWalletSamePreAuthorisedInTime'];
const MOCK_EBSI_PRE_AUTHORISED_DEFERRED_CREDENTIALS = ['CTWalletSamePreAuthorisedDeferred'];
const MOCK_EBSI_PRE_AUTHORISED_PIN_CODE = '1234';
const MOCK_EBSI_PRE_AUTHORISED_CODE = 'conformance';
const MOCK_EBSI_PRESENTATION_DEFINITION = {
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
                    path: ['$.vc.type'],
                    filter: {
                        type: 'array',
                        contains: { const: 'VerifiableAttestation' }
                    }
                }]
            }
        })
    ]
};

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
        private openIDProviderService: OpenIDProviderService,
        private issuer: IssuerService,
        private state: StateService,
        private didService: DidService,
        private resolverService: ResolverService,
        private credentialOfferService: CredentialOfferService,
        private schemaTemplateService: SchemaTemplateService,
        private presentationDefinitionService: PresentationDefinitionService,
        private studentService: StudentService,
        private vpService: VpService,
        private vcService: VcService
    ) { }

    /**
     * Creates or retrieves a DID entity based on the provided DID, then creates a verifiable credential.
     * @param did The Decentralized Identifier (DID) for which the credential is being created.
     * @param requestedCredentials The list of credentials to be included in the verifiable credential.
     * @returns A promise resolving to the ID of the newly created verifiable credential.
     */
    private async createVerifiableCredentialRecord(did: string, requestedCredentials: any[], offer: CredentialOffer): Promise<{ did: Did, vcId: number }> {
        // Attempt to find an existing DID entity by the provided DID.
        let didEntity = await this.didService.findByDid(did);

        // If no DID entity is found, create a new one.
        if (!didEntity) {
            didEntity = await this.didService.create({ identifier: did });
        }

        let studentEntity = await this.studentService.findByDid(didEntity.identifier);
        // Create a new student with the specified DID entity.
        if (!studentEntity) {
            studentEntity = await this.studentService.create({
                first_name: '',
                last_name: '',
                date_of_birth: new Date(),
                nationality: '',
                enrollment_date: new Date(),
                email: '',
                dids: [didEntity]
            } as CreateStudentDto);
        }

        // Create a new verifiable credential with the specified DID entity and requested credentials.
        const newVc = await this.vcService.create({
            did: didEntity,
            requested_credentials: requestedCredentials,
            offer: offer
        });

        // Return the ID of the newly created verifiable credential.
        return { did: didEntity, vcId: newVc.id };
    }

    /**
     * Handles the authorization process.
     * @param request The authorization request object containing necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async authorize(request: AuthorizeRequest): Promise<{ header?: JHeader, code: number, url?: string }> {
        console.log('[authorize]')
        console.log({ request })
        const provider = await this.openIDProviderService.getInstance();
        try {

            if (!request.response_type || !request.client_id) {
                throw createError('INVALID_REQUEST', 'Missing required parameters');
            }
            const issuer_state = request.issuer_state
            const scope = request.scope;
            let offer: CredentialOffer | null = null;
            // Add issuer state validation here
            if (issuer_state) {
                const decodedState = await this.issuer.decodeJWT(issuer_state);
                const decoded = decodedState.payload as any;

                offer = await this.credentialOfferService.getOfferByIssuerState(issuer_state);
                if (!offer) {
                    throw new Error('Invalid or expired offer');
                }

                // Validate expiration
                if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                    throw new Error('Issuer state has expired');
                }

                // Validate client_id matches
                if (decoded.client_id !== request.client_id) {
                    throw new Error('Client ID mismatch in issuer state');
                }

                // Validate credential types if present
                if (request.authorization_details && decoded.credential_types) {
                    const authDetails = typeof request.authorization_details === 'string'
                        ? JSON.parse(request.authorization_details)
                        : request.authorization_details;

                    const requestedTypes = authDetails[0]?.types || [];
                    console.log({ requestedTypes, decoded })
                    if (!arraysAreEqual(requestedTypes, decoded.credential_types)) {
                        throw new Error('Credential types mismatch');
                    }
                }
            }

            const redirectUri = `${process.env.ISSUER_BASE_URL}/direct_post`
            const isVPTokenTest = request.scope?.includes('ver_test:vp_token');
            const isIDTokenTest = request.scope?.includes('ver_test:id_token');

            if ((isVPTokenTest || isIDTokenTest) && process.env.EBSI_NETWORK != EbsiNetwork.CONFORMANCE) {
                throw new Error('Not allowed to use VP token test or ID token test in non-conformant environment');
            }

            let presentationDefinition;

            if (isVPTokenTest) {
                presentationDefinition = MOCK_EBSI_PRESENTATION_DEFINITION;
            } else if (scope !== 'openid') {
                presentationDefinition = await this.presentationDefinitionService.getByScope(scope);
                console.log({ presentationDefinition })
            }

            const { header, redirectUrl, authDetails, serverDefinedState, serverDefinedNonce } = await provider.handleAuthorizationRequest(request, redirectUri, presentationDefinition);

            const payload = {
                authorizationDetails: authDetails,
            }
            await this.state.createAuthState(request.client_id, request.code_challenge, request.code_challenge_method, request.redirect_uri, request.scope, request.response_type, serverDefinedState, serverDefinedNonce, request.state, request.nonce, payload, offer)
            return { header, code: 302, url: redirectUrl };
        } catch (error) {
            throw handleError(error);
        }
    }


    /**
     * Creates an error response URL for OAuth2/OIDC flows
     * 
     * @param url - The base URL to redirect to
     * @param error - The OAuth2 error code (e.g. 'invalid_request', 'unauthorized_client')
     * @param error_description - A human-readable description of the error
     * @param state - The state parameter from the original request to maintain flow context
     * @returns Object containing HTTP status code and formatted error redirect URL
     *
     * @example
     * // Returns {code: 302, url: 'https://client.example.com/callback?error=invalid_request&error_description=Missing+parameters&state=abc123'}
     * createErrorResponse(
     *   'https://client.example.com',
     *   'invalid_request', 
     *   'Missing parameters',
     *   'abc123'
     * )
     */
    private createErrorResponse(url: string, error: string, error_description: string, state: string): { code: number, url: string } {
        const redirectUrl = new URL(`${url}/callback`);
        redirectUrl.searchParams.append('error', error);
        redirectUrl.searchParams.append('error_description', error_description);
        redirectUrl.searchParams.append('state', state);
        return { code: 302, url: redirectUrl.toString() };
    }

    /**
     * Handles the VP token response.
     * @param request The VP token request object.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    private async handleVpTokenResponse(request: VpTokenRequest): Promise<{ header?: JHeader, code: number, url?: string }> {
        const provider = await this.openIDProviderService.getInstance();
        try {
            const vpToken = request.vp_token;
            const presentationSubmission = JSON.parse(request.presentation_submission);


            if (!request.state) {
                throw new Error('Missing state parameter');
            }
            // console.log('INSIDE HANDLE VP TOKEN RESPONSE')
            // console.log({ request })
            console.log({ state: request.state })
            const stateData = await this.state.getByField('serverDefinedState', request.state, StateStep.AUTHORIZE, StateStatus.UNCLAIMED);
            const redirectUri = stateData.redirectUri;

            console.log({ stateData })

            if (!redirectUri) {
                throw new Error('Missing redirect URI');
            }

            const decoded = await provider.decodeIdTokenResponse(vpToken);

            console.log({ decoded })

            if (!('vp' in decoded.payload)) {
                throw new Error('Invalid token: Expected VP token structure');
            }

            const vpPayload = decoded.payload as VPPayload;

            try {
                await this.vpService.verifyVP(vpToken, presentationSubmission, vpPayload);
                console.log('VP VERIFIED')
            } catch (error) {
                console.log('ERROR VERIFYING VP')
                console.log(error)
                if (error instanceof EbsiError) {
                    return this.createErrorResponse(
                        redirectUri,
                        error.error,
                        error.error_description,
                        stateData.walletDefinedState
                    );
                }
                throw error;
            }

            const code = generateRandomString(32);
            const successUrl = new URL(redirectUri);
            console.log({ successUrl })
            successUrl.searchParams.append('code', code);
            successUrl.searchParams.append('state', stateData.walletDefinedState);

            console.log({ successUrl: successUrl.toString() })

            return { code: 302, url: successUrl.toString() };
        } catch (error) {
            throw handleError(error);
        }
    }

    /**
     * Handles the ID token response.
     * @param request The ID token response request object.
     * @param headers The headers record to map to JWT header.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    private async handleIdTokenResponse(request: IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header?: JHeader, code: number, url?: string }> {
        const provider = await this.openIDProviderService.getInstance();
        try {
            if (!request.id_token) {
                throw new Error('Missing id_token parameter');
            }

            const { payload, header } = await provider.decodeIdTokenResponse(request.id_token);

            const state = request.state
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
            const redirectUrl = await provider.createAuthorizationRequest(code, walletDefinedState, redirectUri);
            return { header, code: 302, url: redirectUrl };
        } catch (error) {
            throw handleError(error);
        }
    }

    /**
     * Directly posts the ID token response after mapping headers to JWT header.
     * @param request The ID token response request object.
     * @param headers Headers record to map to JWT header.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async directPost(request: VpTokenRequest | IdTokenResponseRequest, headers: Record<string, string | string[]>): Promise<{ header?: JHeader, code: number, url?: string }> {
        try {
            console.log('DIRECT POST')
            console.log({ request })
            if ('vp_token' in request && 'presentation_submission' in request) {
                return await this.handleVpTokenResponse(request);
            }

            return await this.handleIdTokenResponse(request, headers);
        } catch (error) {
            throw handleError(error);
        }
    }

    /**
     * Processes the token request by validating the code challenge and composing the token response.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async token(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        try {
            console.log('REQUEST', request)
            if (request.grant_type === 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
                return await this.handlePreAuthorizedCode(request);
            }

            return await this.handleStandardTokenRequest(request);
        } catch (error) {
            throw handleError(error);
        }
    }

    /**
     * Handles the pre-authorized code token request.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    private async handlePreAuthorizedCode(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        const provider = await this.openIDProviderService.getInstance();
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
                throw createError(
                    'INVALID_REQUEST',
                    'Invalid pre-authorised code or pin code'
                );
            }
        }
        // ******************

        const stateData = await this.state.getByPreAuthorisedAndPinCode(pinCode, preAuthorisedCode);
        if (!stateData) {
            throw createError('INVALID_REQUEST', 'Invalid pre-authorised code or pin code');
        }
        const idToken = "";
        const authDetails = [];
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60; // seconds

        await this.state.createTokenRequestCNonce(stateData.id, cNonce, cNonceExpiresIn);
        const response = await provider.composeTokenResponse(idToken, cNonce, cNonceExpiresIn, authDetails);
        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the standard token request.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    private async handleStandardTokenRequest(request: TokenRequestBody): Promise<{ header: any, code: number, response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const stateData = await this.state.getByField('code', request.code, StateStep.AUTH_RESPONSE, StateStatus.UNCLAIMED, request.client_id);

        const isCodeChallengeValid = await validateCodeChallenge(stateData.codeChallenge, request.code_verifier);
        if (!isCodeChallengeValid) {
            throw new Error('Invalid code challenge.');
        }

        const idToken = stateData.payload.idToken;
        const authDetails = stateData.payload.authorizationDetails;
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60;

        await this.state.createTokenRequestCNonce(stateData.id, cNonce, cNonceExpiresIn);
        const response = await provider.composeTokenResponse(idToken, cNonce, cNonceExpiresIn, authDetails);

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
            // 1. Validate request and get state
            console.log({ request })
            const { stateData, cNonce } = await this.validateCredentialRequest(request);
            const requestedCredentials = stateData.payload.authorizationDetails[0].types;
            // Create the credential record
            const offerData = stateData.offer;
            const credentialRecord = await this.createVerifiableCredentialRecord(stateData.clientId, requestedCredentials, offerData);

            // 2. Handle conformance test
            if (await this.isConformanceTest(requestedCredentials)) {
                return await this.createCredentialResponseConformance(stateData, { cNonce, requestedCredentials, vcId: credentialRecord.vcId });
            }

            // 3. Create the credential response
            return await this.createCredentialResponse(
                stateData.offer.grant_type,
                {
                    cNonce,
                    stateData,
                    vcId: credentialRecord.vcId,
                }
            );
        } catch (error) {
            console.log('ERROR IN HANDLE CREDENTIAL', error)
            throw handleError(error);
        }
    }

    private async validateCredentialRequest(request: any): Promise<{
        stateData: State,
        cNonce: string
    }> {

        const provider = await this.openIDProviderService.getInstance();
        const decodedRequest = await provider.decodeCredentialRequest(request);
        const cNonce = decodedRequest.nonce;

        const stateData = await this.state.getByField(
            'cNonce',
            cNonce,
            StateStep.TOKEN_REQUEST,
            StateStatus.UNCLAIMED,
            request.client_id
        );

        console.log({ stateData })
        if (decodedRequest.iss !== stateData.clientId) {
            throw new Error('Invalid issuer');
        }

        if (!stateData.offer && (request.types.includes('CTWallet') && process.env.EBSI_NETWORK == EbsiNetwork.CONFORMANCE)) {
            throw new Error('No credential offer found');
        }

        return { stateData, cNonce };
    }




    private async createCredentialResponse(
        grantType: GrantType,
        params: {
            cNonce: string,
            stateData: any,
            vcId: number
        }
    ): Promise<{ header: any, code: number, response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const { cNonce, stateData, vcId } = params;
        const { offer, clientId: subjectDid } = stateData;
        const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;

        console.log('GRANT TYPE', grantType);
        if (grantType === GrantType.PRE_AUTHORIZED_CODE) {
            console.log('[generateAndSignCredential]')
            console.log({ offer })
            // Generate and sign the credential
            const { signedCredential, credential } = await this.vcService.issueVerifiableCredential(vcId);
            // Compose the response
            const response = await provider
                .composeInTimeCredentialResponse(
                    'jwt_vc',
                    cNonce,
                    cNonceExpiresIn,
                    tokenExpiresIn,
                    signedCredential
                );
            // Update the status of the credential
            await this.vcService.updateVerifiableCredential(vcId, credential, "{}"); // don't save the signed credential
            // Update the status of the state
            await this.state.updateStatus(stateData.id, StateStatus.CLAIMED);
            return { header: this.header, code: 200, response };
        }

        const response = await provider
            .composeDeferredCredentialResponse(
                'jwt_vc',
                cNonce,
                cNonceExpiresIn,
                tokenExpiresIn,
                vcId
            );

        await this.state.createDeferredResoponse(stateData.id, response.acceptance_token);
        return { header: this.header, code: 200, response };
    }

    // ******************
    // CONFORMANCE TEST
    // ******************

    public async isConformanceTest(requestedCredentials: string[]): Promise<boolean> {
        return requestedCredentials.includes('CTWalletSameAuthorisedInTime') || requestedCredentials.includes('CTWalletSameAuthorisedDeferred') ||
            requestedCredentials.includes('CTWalletSamePreAuthorisedInTime') || requestedCredentials.includes('CTWalletSamePreAuthorisedDeferred');
    }

    public async createCredentialResponseConformance(stateData: any, params: {
        cNonce: string,
        requestedCredentials: string[],
        vcId: number
    }): Promise<{ header: any, code: number, response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const { cNonce, requestedCredentials, vcId } = params;
        const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        // Issue the verifiable credential
        const signedCredential = await this.vcService.CONFORMANCE_issueVerifiableCredential(vcId, requestedCredentials, stateData.clientId);
        if (!signedCredential) {
            console.log('FAILED TO ISSUE VERIFIABLE CREDENTIAL')
            throw new Error('Failed to issue verifiable credential');
        }

        // If in time requested, return in time response
        if (requestedCredentials.includes('CTWalletSameAuthorisedInTime') || requestedCredentials.includes('CTWalletSamePreAuthorisedInTime')) {
            console.log('IN TIME RESPONSE')
            const inTimeCredentialResponse = await provider.composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, signedCredential);
            console.log('IN TIME RESPONSE', inTimeCredentialResponse)
            return { header: this.header, code: 200, response: inTimeCredentialResponse };
        }

        // If deferred requested, return the deferred response
        if (requestedCredentials.includes('CTWalletSameAuthorisedDeferred') || requestedCredentials.includes('CTWalletSamePreAuthorisedDeferred')) {
            console.log('DEFERRED RESPONSE')
            const deferredCredentialResponse = await provider.composeDeferredCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, vcId);
            console.log('DEFERRED RESPONSE', deferredCredentialResponse)
            return { header: this.header, code: 200, response: deferredCredentialResponse };
        }
        throw new EbsiError(ERROR_CODES.INVALID_REQUEST, 'No credential response', 400);
    }

    // ******************
    // END CONFORMANCE TEST
    // ******************


    /**
     * Handles the processing of a deferred credential response.
     * @param request The request object containing the acceptance token and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentilDeferred(body: any, headers: any): Promise<{ header: any, code: number, response: any }> {
        const provider = await this.openIDProviderService.getInstance();
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
                const { schemaTemplateId, templateData } = credential.offer.credential_offer_data;
                const { signedCredential } = await this.vcService.generateAndSignCredential(
                    this.issuer.getDid(),
                    credential.did.identifier,
                    schemaTemplateId,
                    templateData
                );
                const response = await provider.composeInTimeCredentialResponse('jwt_vc', cNonce, cNonceExpiresIn, tokenExpiresIn, signedCredential);
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
    // async offerPreAuthorisedCredential(pinCode: string, preAuthorisedCode: string) {
    //     try {
    //         // Validate the pin-code and pre-authorised code
    //         const isValid = await this.validatePreAuthorisedCode(pinCode, preAuthorisedCode);
    //         if (!isValid) {
    //             throw new Error('Invalid pin-code or pre-authorised code');
    //         }

    //         // Initiate the credential issuance process
    //         await this.issuePreAuthorisedCredential(pinCode, preAuthorisedCode);

    //     } catch (error) {
    //         throw handleError(error);
    //     }
    // }

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
     * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
     * @returns A promise resolving to an object containing the issued credential.
     */
    // async issuePreAuthorisedCredential(pinCode: string, preAuthorisedCode: string) {
    //     try {

    //         const state = await this.state.getByPreAuthorisedAndPinCode(pinCode, preAuthorisedCode);

    //         if (!state || !state.clientId || state.preAuthorisedCodeIsUsed) {
    //             throw new Error('Invalid pre-authorised code');
    //         }
    //         // Retrieve the DID of the user from the pre-authorised code
    //         const did = state.clientId;
    //         // Define the requested credentials
    //         const requestedCredentials = state?.payload?.authorizationDetails?.[0]?.types ?? [];
    //         if (requestedCredentials.length === 0) {
    //             throw new Error('No requested credentials in state');
    //         }
    //         // Create the verifiable credential
    //         const cred = await this.createVerifiableCredentialRecord(did, requestedCredentials);
    //         // If not mock, issue the verifiable credential
    //         // For the conformance test, we issue the verifiable credential else where
    //         if (!preAuthorisedCode.startsWith(MOCK_EBSI_PRE_AUTHORISED_CODE)) {
    //             await this.vcService.issueVerifiableCredential(cred.vcId);
    //         }

    //     } catch (error) {
    //         throw handleError(error);
    //     }
    // }
}