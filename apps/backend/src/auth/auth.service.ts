import { Injectable } from "@nestjs/common";
import {
    AuthorizeRequest,
    JHeader,
    TokenRequestBody,
    IdTokenResponseRequest,
    generateRandomString,
    VPPayload,
} from "@protokol/kredential-core";
import { OpenIDProviderService } from "./../openId/openId.service";
import { IssuerService } from "./../issuer/issuer.service";
import {
    extractBearerToken,
    arraysAreEqual,
    isConformanceTestScope,
    validateClientId,
} from "./auth.utils";
import { VcService } from "./../vc/vc.service";
import { DidService } from "./../student/did.service";
import { VCStatus } from "./../types/VC";
import { validateCodeChallenge } from "./../issuer/hash.util";
import { ResolverService } from "./../resolver/resolver.service";
import { StateService } from "./../state/state.service";
import { StateStep } from "./../state/enum/step.enum";
import { StateStatus } from "./../state/enum/status.enum";
import { EbsiNetwork } from "src/network/ebsi-network.types";
import { Did } from "@entities/did.entity";
import { CredentialOfferService } from "src/credential-offer/credential-offer.service";
import { GrantType } from "src/credential-offer/credential-offer.type";
import { CredentialOffer } from "@entities/credential-offer.entity";
import { handleError } from "src/error/ebsi-error.util";
import { createError, EbsiError, ERROR_CODES } from "src/error/ebsi-error";
import { VpService } from "src/vp/vp.service";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { State } from "@entities/state.entity";
import { StudentService } from "src/student/student.service";
import { CreateStudentDto } from "src/student/dto/create-student";
import { ScopeCredentialMappingService } from "src/scope-mapping/scope-mapping.service";
import { CreateOfferDto } from "src/credential-offer/dto/createOfferDto";
import { ClaimStatus } from "@entities/credential-claim.entity";
import { InteropService } from "src/interop/interop.service";

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const MOCK_EBSI_PRE_AUTHORISED_DID =
    "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kboj7g9PfXJxbbs4KYegyr7ELnFVnpDMzbJJDDNZjavX6jvtDmALMbXAGW67pdTgFea2FrGGSFs8Ejxi96oFLGHcL4P6bjLDPBJEvRRHSrG4LsPne52fczt2MWjHLLJBvhAC";
const MOCK_EBSI_PRE_AUTHORISED_IN_TIME_CREDENTIALS = [
    "CTWalletSamePreAuthorisedInTime",
];
const MOCK_EBSI_PRE_AUTHORISED_DEFERRED_CREDENTIALS = [
    "CTWalletSamePreAuthorisedDeferred",
];
const MOCK_EBSI_PRE_AUTHORISED_PIN_CODE = "1234";
const MOCK_EBSI_PRE_AUTHORISED_CODE = "conformance";
const MOCK_EBSI_PRESENTATION_DEFINITION = {
    id: generateRandomString(32),
    format: {
        jwt_vp: { alg: ["ES256"] },
        jwt_vc: { alg: ["ES256"] },
    },
    input_descriptors: [
        // Three identical descriptors as per EBSI conformance
        ...Array(3).fill({
            id: generateRandomString(32),
            format: {
                jwt_vc: { alg: ["ES256"] },
            },
            constraints: {
                fields: [
                    {
                        path: ["$.vc.type"],
                        filter: {
                            type: "array",
                            contains: { const: "VerifiableAttestation" },
                        },
                    },
                ],
            },
        }),
    ],
};

@Injectable()
export class AuthService {
    // Represents the header configuration used across various HTTP requests.
    private header = {
        "Content-Type": "application/x-www-form-urlencoded",
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
        private presentationDefinitionService: PresentationDefinitionService,
        private scopeCredentialMappingService: ScopeCredentialMappingService,
        private studentService: StudentService,
        private vpService: VpService,
        private vcService: VcService,
        private interopService: InteropService,
    ) {}

    /**
     * Creates or retrieves a DID entity based on the provided DID, then creates a verifiable credential.
     * @param did The Decentralized Identifier (DID) for which the credential is being created.
     * @param requestedCredentials The list of credentials to be included in the verifiable credential.
     * @returns A promise resolving to the ID of the newly created verifiable credential.
     */
    private async createVerifiableCredentialRecord(
        did: string,
        requestedCredentials: any[],
        offer: CredentialOffer,
    ): Promise<{ did: Did; vcId: number }> {
        // Attempt to find an existing DID entity by the provided DID.
        let didEntity = await this.didService.findByDid(did);

        // If no DID entity is found, create a new one.
        if (!didEntity) {
            didEntity = await this.didService.create({ identifier: did });
        }

        let studentEntity = await this.studentService.findByDid(
            didEntity.identifier,
        );
        // Create a new student with the specified DID entity.
        if (!studentEntity) {
            studentEntity = await this.studentService.create({
                first_name: "",
                last_name: "",
                date_of_birth: new Date(),
                nationality: "",
                enrollment_date: new Date(),
                email: "",
                dids: [didEntity],
            } as CreateStudentDto);
        }

        // Create a new verifiable credential with the specified DID entity and requested credentials.
        const newVc = await this.vcService.create({
            did: didEntity,
            requested_credentials: requestedCredentials,
            offer: offer,
        });

        // Return the ID of the newly created verifiable credential.
        return { did: didEntity, vcId: newVc.id };
    }

    /**
     * Handles the authorization process.
     * @param request The authorization request object containing necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */
    async authorize(
        request: AuthorizeRequest,
    ): Promise<{ header?: JHeader; code: number; url?: string }> {
        const provider = await this.openIDProviderService.getInstance();
        const redirectUri = `${process.env.ISSUER_BASE_URL}/direct_post`;
        const { isVPTokenTest, isIDTokenTest, isVPTokenInteroperabilityTest } =
            isConformanceTestScope(request.scope);

        if (
            (isVPTokenTest || isIDTokenTest) &&
            process.env.EBSI_NETWORK != EbsiNetwork.CONFORMANCE
        ) {
            throw new Error(
                "Not allowed to use VP token test or ID token test in non-conformant environment",
            );
        }

        try {
            if (!request.response_type || !request.client_id) {
                throw createError(
                    "INVALID_REQUEST",
                    "Missing required parameters",
                );
            }

            // Validate client_id format
            if (!validateClientId(request.client_id)) {
                throw createError(
                    "INVALID_REQUEST",
                    "Invalid client_id format. Must be a valid HTTPS URL",
                );
            }

            const issuer_state = request.issuer_state;
            const scope = request.scope;
            let offer: CredentialOffer | null = null;

            // Add issuer state validation here
            if (scope == "openid") {
                if (issuer_state) {
                    const decodedState =
                    await this.issuer.decodeJWT(issuer_state);
                    const decoded = decodedState.payload as any;

                    offer =
                        await this.credentialOfferService.getOfferByIssuerState(
                            issuer_state,
                        );
                    if (!offer) {
                        throw new Error("Invalid or expired offer");
                    }

                    // Validate expiration
                    if (
                        decoded.exp &&
                        decoded.exp < Math.floor(Date.now() / 1000)
                    ) {
                        throw new Error("Issuer state has expired");
                    }

                    // Validate client_id matches
                    if (decoded.client_id !== request.client_id) {
                        throw new Error("Client ID mismatch in issuer state");
                    }

                    // Validate credential types if present
                    if (
                        request.authorization_details &&
                        decoded.credential_types
                    ) {
                        const authDetails =
                            typeof request.authorization_details === "string"
                                ? JSON.parse(request.authorization_details)
                                : request.authorization_details;

                        const requestedTypes = authDetails[0]?.types || [];
                        if (
                            !arraysAreEqual(
                                requestedTypes,
                                decoded.credential_types,
                            )
                        ) {
                            throw new Error("Credential types mismatch");
                        }
                    }
                }
            } else if (!isVPTokenTest && !isIDTokenTest) {
                // Manually create the offer in order to save the schemaTemplateId that will be use to create the VC
                try {
                    const template =
                        await this.scopeCredentialMappingService.getCredentialSchemaByScope(
                            scope,
                        );
                    const createOfferDto: CreateOfferDto = {
                        schemaTemplateId: template.id,
                        credentialData: {},
                        offerConfiguration: {
                            grantType: GrantType.AUTHORIZATION_CODE,
                            scope: scope,
                        },
                    };
                    offer = await this.credentialOfferService.createOffer(
                        createOfferDto,
                        "USED",
                    );
                } catch (error) {
                    throw createError("INVALID_REQUEST", "Invalid scope");
                }
            }

            let presentationDefinition;

            if (isVPTokenTest || isIDTokenTest) {
                presentationDefinition = MOCK_EBSI_PRESENTATION_DEFINITION;
            } else if (scope !== "openid") {
                presentationDefinition =
                    await this.presentationDefinitionService.getByScope(scope);
            }

            const { header, redirectUrl, authDetails, serverDefinedState, serverDefinedNonce} = await provider.handleAuthorizationRequest(request, redirectUri, presentationDefinition);

            const walletDefinedState =
                request.state || generateRandomString(32);
            const walletDefinedNonce =
                request.nonce || generateRandomString(32);

            await this.state.createAuthState(
                request.client_id,
                request.code_challenge || "",
                request.code_challenge_method || "S256",
                request.redirect_uri,
                scope,
                request.response_type,
                serverDefinedState,
                serverDefinedNonce,
                walletDefinedState,
                walletDefinedNonce,
                { offer },
                offer,
            );

            // If this is a VP token test, ensure the response_type includes vp_token
            if (isVPTokenTest && !request.response_type.includes("vp_token")) {
                throw createError(
                    "INVALID_REQUEST",
                    "VP token test requires response_type to include vp_token",
                );
            }
            return { code: 302, url: redirectUrl };
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
    private createErrorResponse(
        url: string,
        error: string,
        error_description: string,
        state: string,
    ): { code: number; url: string } {
        const redirectUrl = new URL(`${url}/callback`);
        redirectUrl.searchParams.append("error", error);
        redirectUrl.searchParams.append("error_description", error_description);
        redirectUrl.searchParams.append("state", state);
        return { code: 302, url: redirectUrl.toString() };
    }

    /**
     * Handles the VP token response.
     * @param request The VP token request object.
     * @returns A promise resolving to an object containing the header, HTTP status code, and redirect URL.
     */

    private async getPresentationDefinition(
        isVPTokenTest: boolean,
        isIDTokenTest: boolean,
        scope: string,
        definitionId: string,
    ) {
        if (isVPTokenTest || isIDTokenTest) {
            return MOCK_EBSI_PRESENTATION_DEFINITION;
        } else if (scope !== "openid") {
            return await this.presentationDefinitionService.getByScope(scope);
        }
        return null;
    }

    private async handleVpTokenResponse(
        request: VpTokenRequest,
    ): Promise<{ header?: JHeader; code: number; url?: string }> {
        const provider = await this.openIDProviderService.getInstance();
        try {
            const vpToken = request.vp_token;
            const presentationSubmission = JSON.parse(
                request.presentation_submission,
            );

            console.log("-->request", request.scope);

            if (!request.state) {
                throw new Error("Missing state parameter");
            }

            const stateData = await this.state.getByField(
                "serverDefinedState",
                request.state,
                StateStep.AUTHORIZE,
                StateStatus.UNCLAIMED,
            );

            console.log("-->stateData", stateData);

            const redirectUri = stateData.redirectUri;
            const { isVPTokenTest, isIDTokenTest } = isConformanceTestScope(
                stateData.scope,
            );

            if (!redirectUri) {
                throw new Error("Missing redirect URI");
            }

            const { payload, header } =
                await provider.decodeIdTokenResponse(vpToken);

            if (!("vp" in payload)) {
                throw new Error("Invalid token: Expected VP token structure");
            }

            const vpPayload = payload as VPPayload;
            const presentationDefinition = await this.getPresentationDefinition(
                isVPTokenTest,
                isIDTokenTest,
                stateData.scope,
                presentationSubmission.definition_id,
            );

            try {
                await this.vpService.verifyVP(
                    vpToken,
                    presentationDefinition,
                    presentationSubmission,
                    vpPayload,
                );
            } catch (error) {
                if (error instanceof EbsiError) {
                    return this.createErrorResponse(
                        redirectUri,
                        error.error,
                        error.error_description,
                        stateData.walletDefinedState,
                    );
                }
                throw error;
            }

            const code = generateRandomString(32);
            const walletDefinedState = stateData.walletDefinedState;
            const successUrl = new URL(redirectUri);
            successUrl.searchParams.append("code", code);
            successUrl.searchParams.append(
                "state",
                stateData.walletDefinedState,
            );

            // Update the state for the client, including the generated code and ID token.
            await this.state.createAuthResponseNonce(
                stateData.id,
                code,
                request.vp_token,
            );
            const redirectUrl = await provider.createAuthorizationRequest(
                code,
                walletDefinedState,
                redirectUri,
            );
            return { header, code: 302, url: redirectUrl };
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
    private async handleIdTokenResponse(
        request: IdTokenResponseRequest,
        headers: Record<string, string | string[]>,
    ): Promise<{ header?: JHeader; code: number; url?: string }> {
        const provider = await this.openIDProviderService.getInstance();
        try {
            if (!request.id_token) {
                throw new Error("Missing id_token parameter");
            }

            const { payload, header } = await provider.decodeIdTokenResponse(
                request.id_token,
            );
            const state = request.state;
            if (!state) {
                throw new Error("Missing state parameter");
            }
            // Extract the issuer from the payload or header.
            let issuer = "";
            if (payload.iss && payload.iss.startsWith("did:")) {
                issuer = payload.iss;
            } else if (header.kid && header.kid.startsWith("did:")) {
                issuer = header.kid.trim().split("#")[0];
            }

            const resolvedPublicKeysFromDid =
                await this.resolverService.resolveDID(issuer);
            if (!resolvedPublicKeysFromDid) {
                throw new Error("Failed to resolve DID");
            }

            // Verify the request.
            await this.issuer.verifyJWT(
                request.id_token,
                resolvedPublicKeysFromDid,
                issuer,
                header.alg,
            );
            const stateData = await this.state.getByField(
                "serverDefinedState",
                state,
                StateStep.AUTHORIZE,
                StateStatus.UNCLAIMED,
                issuer,
            );
            console.log({
                stateData
            })

            // Generate a unique code for the client.
            const code = generateRandomString(25);
            // Extract the client-defined state from the authorization response.
            const walletDefinedState = stateData.walletDefinedState;
            const redirectUri = stateData.redirectUri ?? "openid://";

            // Update the state for the client, including the generated code and ID token.
            await this.state.createAuthResponseNonce(
                stateData.id,
                code,
                request.id_token,
            );
            const redirectUrl = await provider.createAuthorizationRequest(
                code,
                walletDefinedState,
                redirectUri,
            );
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
    async directPost(
        request: VpTokenRequest | IdTokenResponseRequest,
        headers: Record<string, string | string[]>,
    ): Promise<{ header?: JHeader; code: number; url?: string }> {
        try {
            console.log("INSIDE DIRECT POST");
            console.log("-->request", request);
            if ("vp_token" in request && "presentation_submission" in request) {
                console.log("VP TOKEN RESPONSE");
                console.log({request})
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
    async token(
        request: TokenRequestBody,
    ): Promise<{ header: any; code: number; response: any }> {
        try {
            if (
                request.grant_type ===
                "urn:ietf:params:oauth:grant-type:pre-authorized_code"
            ) {
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
    private async handlePreAuthorizedCode(
        request: TokenRequestBody,
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const pinCode = request.user_pin;
        const preAuthorisedCode = request["pre-authorized_code"];

        if (!pinCode || !preAuthorisedCode) {
            throw new Error("Missing user pin or pre-authorized code");
        }
        // ******************
        // CONFORMANCE TEST
        // ******************
        if (
            pinCode === MOCK_EBSI_PRE_AUTHORISED_PIN_CODE &&
            preAuthorisedCode.startsWith(MOCK_EBSI_PRE_AUTHORISED_CODE)
        ) {
            await this.state.deleteByPreAuthorisedAndPinCode(
                pinCode,
                preAuthorisedCode,
            );
            if (
                preAuthorisedCode.startsWith(
                    `${MOCK_EBSI_PRE_AUTHORISED_CODE}InTime`,
                )
            ) {
                await this.state.createPreAuthorisedAndPinCode(
                    pinCode,
                    preAuthorisedCode,
                    MOCK_EBSI_PRE_AUTHORISED_DID,
                    MOCK_EBSI_PRE_AUTHORISED_IN_TIME_CREDENTIALS,
                );
            } else if (
                preAuthorisedCode.startsWith(
                    `${MOCK_EBSI_PRE_AUTHORISED_CODE}Deferred`,
                )
            ) {
                await this.state.createPreAuthorisedAndPinCode(
                    pinCode,
                    preAuthorisedCode,
                    MOCK_EBSI_PRE_AUTHORISED_DID,
                    MOCK_EBSI_PRE_AUTHORISED_DEFERRED_CREDENTIALS,
                );
            } else {
                throw createError(
                    "INVALID_REQUEST",
                    "Invalid pre-authorised code or pin code",
                );
            }
        }
        // ******************

        const stateData = await this.state.getByPreAuthorisedAndPinCode(
            pinCode,
            preAuthorisedCode,
        );
        if (!stateData) {
            throw createError(
                "INVALID_REQUEST",
                "Invalid pre-authorised code or pin code",
            );
        }
        const idToken = "";
        const authDetails = [];
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60; // seconds

        await this.state.createTokenRequestCNonce(
            stateData.id,
            cNonce,
            cNonceExpiresIn,
        );
        const response = await provider.composeTokenResponse(
            idToken,
            cNonce,
            cNonceExpiresIn,
            authDetails,
        );
        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the standard token request.
     * @param request The token request body.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    private async handleStandardTokenRequest(
        request: TokenRequestBody,
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const stateData = await this.state.getByField(
            "code",
            request.code,
            StateStep.AUTH_RESPONSE,
            StateStatus.UNCLAIMED,
            request.client_id,
        );
        if (!stateData) {
            throw new Error("Invalid code");
        }
        const isCodeChallengeValid = await validateCodeChallenge(
            stateData.codeChallenge,
            request.code_verifier,
        );
        if (!isCodeChallengeValid) {
            throw new Error("Invalid code challenge.");
        }

        const idToken = stateData.payload.idToken;
        const authDetails = stateData.payload.authorizationDetails;
        const cNonce = generateRandomString(20);
        const cNonceExpiresIn = 60 * 60;

        await this.state.createTokenRequestCNonce(
            stateData.id,
            cNonce,
            cNonceExpiresIn,
        );
        const response = await provider.composeTokenResponse(
            idToken,
            cNonce,
            cNonceExpiresIn,
            authDetails,
        );

        return { header: this.header, code: 200, response };
    }

    /**
     * Handles the creation of a deferred credential response.
     * @param headers Request headers.
     * @param request The request object containing the nonce and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */

    async credentail(
        request: any,
    ): Promise<{ header: any; code: number; response: any }> {
        try {
            // 1. Validate request and get state
            const { stateData, cNonce } =
                await this.validateCredentialRequest(request);

            // Get the requested credentials
            let requestedCredentials: string[];
            let offerData = stateData.offer;

            try {
                requestedCredentials = this.getRequestedCredentials(stateData);
                if (requestedCredentials.length === 0) {
                    const scope = stateData.scope;
                    if (scope) {
                        const schema =
                            await this.scopeCredentialMappingService.getCredentialSchemaByScope(
                                scope,
                            );
                        requestedCredentials = schema.types;
                    } else {
                        throw new Error("No requested credentials found");
                    }
                }
            } catch (error) {
                console.error(
                    "Error retrieving requested credentials:",
                    error.message,
                );
                throw new Error("Error retrieving requested credentials");
            }

            const credentialRecord =
                await this.createVerifiableCredentialRecord(
                    stateData.clientId,
                    requestedCredentials,
                    offerData,
                );

            // 2. Handle conformance test
            if (await this.isConformanceTest(requestedCredentials)) {
                return await this.createCredentialResponseConformance(
                    stateData,
                    {
                        cNonce,
                        requestedCredentials,
                        vcId: credentialRecord.vcId,
                    },
                );
            }

            // 3. Handle interop test
            if (await this.isInteropTest(requestedCredentials)) {
                const response = await this.createCredentialResponseInterop(
                    stateData,
                    {
                        cNonce,
                        requestedCredentials,
                        vcId: credentialRecord.vcId,
                    },
                );
                return response;
            }

            // 3. Create the credential response
            const grantType =
                stateData.offer?.grant_type ?? GrantType.AUTHORIZATION_CODE;
            return this.createCredentialResponse(grantType, {
                cNonce,
                stateData,
                vcId: credentialRecord.vcId,
            });
        } catch (error) {
            throw handleError(error);
        }
    }

    private async validateCredentialRequest(request: any): Promise<{
        stateData: State;
        cNonce: string;
    }> {
        const provider = await this.openIDProviderService.getInstance();
        const decodedRequest = await provider.decodeCredentialRequest(request);
        const cNonce = decodedRequest.nonce;

        const stateData = await this.state.getByField(
            "cNonce",
            cNonce,
            StateStep.TOKEN_REQUEST,
            StateStatus.UNCLAIMED,
            request.client_id,
        );

        if (decodedRequest.iss !== stateData.clientId) {
            throw new Error("Invalid issuer");
        }
        if (
            !stateData.offer &&
            Array.isArray(request.types) &&
            request.types.includes("CTWallet") &&
            process.env.EBSI_NETWORK === EbsiNetwork.CONFORMANCE
        ) {
            throw new Error("No credential offer found");
        }

        return { stateData, cNonce };
    }

    private async createCredentialResponse(
        grantType: GrantType,
        params: {
            cNonce: string;
            stateData: any;
            vcId: number;
        },
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const { cNonce, stateData, vcId } = params;
        const { offer, clientId: subjectDid } = stateData;
        const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        if (
            grantType === GrantType.PRE_AUTHORIZED_CODE ||
            stateData.scope !== "openid"
        ) {
            // Generate and sign the credential
            const { signedCredential, credential } =
                await this.vcService.issueVerifiableCredential(vcId);
            // Compose the response
            const response = await provider.composeInTimeCredentialResponse(
                "jwt_vc",
                cNonce,
                cNonceExpiresIn,
                tokenExpiresIn,
                signedCredential,
            );
            // Update the status of the credential
            await this.vcService.updateVerifiableCredential(
                vcId,
                credential,
                "{}",
            ); // don't save the signed credential
            // Update the status of the state
            await this.state.updateStatus(stateData.id, StateStatus.CLAIMED);
            return { header: this.header, code: 200, response };
        }

        const response = await provider.composeDeferredCredentialResponse(
            "jwt_vc",
            cNonce,
            cNonceExpiresIn,
            tokenExpiresIn,
            vcId,
        );

        await this.state.createDeferredResoponse(
            stateData.id,
            response.acceptance_token,
        );
        return { header: this.header, code: 200, response };
    }

    // ******************
    // CONFORMANCE TEST
    // ******************

    public async isConformanceTest(
        requestedCredentials: string[],
    ): Promise<boolean> {
        if (!Array.isArray(requestedCredentials)) {
            return false;
        }
        return (
            requestedCredentials.includes("CTWalletSameAuthorisedInTime") ||
            requestedCredentials.includes("CTWalletSameAuthorisedDeferred") ||
            requestedCredentials.includes("CTWalletSamePreAuthorisedInTime") ||
            requestedCredentials.includes("CTWalletSamePreAuthorisedDeferred")
        );
    }

    public async isInteropTest(
        requestedCredentials: string[],
    ): Promise<boolean> {
        if (!Array.isArray(requestedCredentials)) {
            return false;
        }
        return (
            requestedCredentials.includes("ITStudentIDCardInTime") ||
            requestedCredentials.includes("ITPreAuthStudentCredential") ||
            requestedCredentials.includes("ITDeferredStudentCredential") ||
            requestedCredentials.includes("VerificationStudentCredential")
        );
    }

    public async createCredentialResponseConformance(
        stateData: any,
        params: {
            cNonce: string;
            requestedCredentials: string[];
            vcId: number;
        },
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const { cNonce, requestedCredentials, vcId } = params;
        const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        // Issue the verifiable credential
        const signedCredential =
            await this.vcService.CONFORMANCE_issueVerifiableCredential(
                vcId,
                requestedCredentials,
                stateData.clientId,
            );
        if (!signedCredential) {
            throw new Error("Failed to issue verifiable credential");
        }

        // If in time requested, return in time response
        if (
            requestedCredentials.includes("CTWalletSameAuthorisedInTime") ||
            requestedCredentials.includes("CTWalletSamePreAuthorisedInTime")
        ) {
            const inTimeCredentialResponse =
                await provider.composeInTimeCredentialResponse(
                    "jwt_vc",
                    cNonce,
                    cNonceExpiresIn,
                    tokenExpiresIn,
                    signedCredential,
                );
            return {
                header: this.header,
                code: 200,
                response: inTimeCredentialResponse,
            };
        }

        // If deferred requested, return the deferred response
        if (
            requestedCredentials.includes("CTWalletSameAuthorisedDeferred") ||
            requestedCredentials.includes("CTWalletSamePreAuthorisedDeferred")
        ) {
            const deferredCredentialResponse =
                await provider.composeDeferredCredentialResponse(
                    "jwt_vc",
                    cNonce,
                    cNonceExpiresIn,
                    tokenExpiresIn,
                    vcId,
                );
            return {
                header: this.header,
                code: 200,
                response: deferredCredentialResponse,
            };
        }
        throw new EbsiError(
            ERROR_CODES.INVALID_REQUEST,
            "No credential response",
            400,
        );
    }

    public async createCredentialResponseInterop(
        stateData: any,
        params: {
            cNonce: string;
            requestedCredentials: string[];
            vcId: number;
        },
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        const { cNonce, requestedCredentials, vcId } = params;
        const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS;
        const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;

        // If in time requested, return in time response
        if (
            requestedCredentials.includes("ITStudentIDCardInTime") ||
            requestedCredentials.includes("ITPreAuthStudentCredential") ||
            requestedCredentials.includes("VerificationStudentCredential")
        ) {
            // Issue the verifiable credential
            const signedCredential =
                await this.vcService.CONFORMANCE_issueVerifiableCredential(
                    vcId,
                    requestedCredentials,
                    stateData.clientId,
                );
            if (!signedCredential) {
                throw new Error("Failed to issue verifiable credential");
            }
            const inTimeCredentialResponse =
                await provider.composeInTimeCredentialResponse(
                    "jwt_vc",
                    cNonce,
                    cNonceExpiresIn,
                    tokenExpiresIn,
                    signedCredential,
                );
            // After successful credential issuance, update the claim status
            if (stateData.clientId) {
                const claim = await this.interopService.findOne({
                    where: {
                        offer: {
                            id: stateData.offer.id,
                        },
                    },
                });

                if (claim) {
                    claim.status = ClaimStatus.CLAIMED;
                    claim.claimedAt = new Date();
                }
            }

            return {
                header: this.header,
                code: 200,
                response: inTimeCredentialResponse,
            };
        } else if (
            requestedCredentials.includes("ITDeferredStudentCredential")
        ) {
            const deferredCredentialResponse =
                await provider.composeDeferredCredentialResponse(
                    "jwt_vc",
                    cNonce,
                    cNonceExpiresIn,
                    tokenExpiresIn,
                    vcId,
                );
            const credential = await this.vcService.findOne(vcId);
            if (credential) {
                credential.status = VCStatus.ISSUED;
                await this.vcService.updateVerifiableCredential(
                    vcId,
                    credential,
                    "{}",
                ); // don't save the signed credential
            }

            return {
                header: this.header,
                code: 200,
                response: deferredCredentialResponse,
            };
        }
        throw new EbsiError(
            ERROR_CODES.INVALID_REQUEST,
            "No credential response",
            400,
        );
    }

    // ******************
    // END CONFORMANCE TEST
    // ******************

    /**
     * Handles the processing of a deferred credential response.
     * @param request The request object containing the acceptance token and other necessary details.
     * @returns A promise resolving to an object containing the header, HTTP status code, and response data.
     */
    async credentilDeferred(
        body: any,
        headers: any,
    ): Promise<{ header: any; code: number; response: any }> {
        const provider = await this.openIDProviderService.getInstance();
        // Check if the request headers are defined
        if (!headers) {
            return {
                header: this.header,
                code: 400,
                response: "Missing request headers",
            };
        }
        // Check if the Authorization header is present
        if (!headers["Authorization"] && !headers["authorization"]) {
            return {
                header: this.header,
                code: 400,
                response: "Missing Authorization header",
            };
        }
        // Extract the bearer token from the request headers.
        const acceptanceToken = extractBearerToken(headers);
        // Decode the acceptance token to validate its contents.
        const { header, payload } =
            await this.issuer.verifyBearerToken(acceptanceToken);
        const bearerPayload = payload as unknown as { vcId: number };
        // Validate the decoded acceptance token.
        if (!payload || !bearerPayload.vcId) {
            return {
                header: this.header,
                code: 400,
                response: "Invalid acceptance token",
            };
        }
        // Retrieve the credential by its ID.
        const credential = await this.vcService.findOne(bearerPayload.vcId);

        if (!credential) {
            return {
                header: this.header,
                code: 500,
                response: "Credential not found",
            };
        }
        // Determine the response based on the credential's status.
        switch (credential.status) {
            case VCStatus.ISSUED:
                const cNonce = generateRandomString(25);
                const cNonceExpiresIn = ONE_HOUR_IN_MILLISECONDS; // TODO: Update!!!
                const tokenExpiresIn = ONE_HOUR_IN_MILLISECONDS;
                if (
                    credential.requested_credentials.some((credential) =>
                        credential.includes("CTWallet"),
                    )
                ) {
                    const response =
                        await provider.composeInTimeCredentialResponse(
                            "jwt_vc",
                            cNonce,
                            cNonceExpiresIn,
                            tokenExpiresIn,
                            credential.credential_signed,
                        );
                    return {
                        header: this.header,
                        code: 200,
                        response: response,
                    };
                } else {
                    const { schemaTemplateId, templateData } =
                        credential.offer.credential_offer_data;
                    const { signedCredential } =
                        await this.vcService.generateAndSignCredential(
                            this.issuer.getDid(),
                            credential.did.identifier,
                            schemaTemplateId,
                            templateData,
                        );
                    const response =
                        await provider.composeInTimeCredentialResponse(
                            "jwt_vc",
                            cNonce,
                            cNonceExpiresIn,
                            tokenExpiresIn,
                            signedCredential,
                        );
                    return {
                        header: this.header,
                        code: 200,
                        response: response,
                    };
                }
            case VCStatus.PENDING:
                return {
                    header: this.header,
                    code: 202,
                    response: "Credential status: pending",
                };
            case VCStatus.REJECTED:
                return {
                    header: this.header,
                    code: 403,
                    response: "Credential status: rejected",
                };
            default:
                return {
                    header: this.header,
                    code: 500,
                    response: "Credential not found",
                };
        }
    }

    /**
     * Retrieves the requested credentials from the state data.
     * @param stateData The state data containing the authorization details.
     * @returns An array of requested credentials.
     */
    private getRequestedCredentials(stateData: any): string[] {
        const authorizationDetails = stateData?.payload?.authorizationDetails;
        // Check if authorizationDetails is an array and has at least one element
        if (
            Array.isArray(authorizationDetails) &&
            authorizationDetails.length > 0
        ) {
            const firstDetail = authorizationDetails[0];

            // Check if 'types' exists in the first element and is an array
            if (firstDetail && Array.isArray(firstDetail.types)) {
                return firstDetail.types;
            } else {
                // Handle the case where 'types' is not present
                console.error("Types not found in authorization details");
                // throw new Error('Missing types in authorization details');

                return [];
            }
        }

        if (stateData?.payload?.offer?.credential_types) {
            return stateData.payload.offer.credential_types;
        }

        if (stateData?.payload?.offer?.requested_credentials) {
            return stateData.payload.requested_credentials;
        }

        return [];
    }

    /**
     * Validates the pre-authorised code and pin-code.
     * @param pinCode The pin-code entered by the user.
     * @param preAuthorisedCode The pre-authorised code used in the Credential Offering.
     * @returns A promise resolving to a boolean indicating whether the validation was successful.
     */
    private async validatePreAuthorisedCode(
        pinCode: string,
        preAuthorisedCode: string,
    ): Promise<boolean> {
        return this.state.validatePreAuthorisedAndPinCode(
            pinCode,
            preAuthorisedCode,
        );
    }
}
