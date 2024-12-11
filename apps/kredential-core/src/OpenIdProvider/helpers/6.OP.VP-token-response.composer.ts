
import { BearerToken, AuthorizationDetail, VPJWT, VPPayload, VP, PresentationSubmission, JHeader } from '..';
import { parseDuration } from '../utils/parse-duration.utility';
import { JwtUtil } from '../../Signer/jwtUtil.interface';
import { VPTokenResponse } from '../interfaces/vp-token-response.interface';

interface JWK {
    kid?: string;
    iss?: string;
    aud?: string[];
    sub?: string;
}
/**
 * Constructs and customizes a token response.
 */
export class VPTokenResponseComposer {
    private header?: JHeader;
    private payload: VPPayload;
    private presentationSubmission: PresentationSubmission;
    private state: string;
    private jwtUtil: JwtUtil;

    /**
     * Initializes a new instance of the TokenResponseComposer with essential parameters for a token response.
     * @param privateKeyJWK - The private key in JWK format used for signing the JWT.
     * @param vp - The VP object.
     * @param nonce - The nonce value.
     * @param jwtUtil - The JWT utility instance.
     */
    constructor(payload: VPPayload, presentationSubmission: PresentationSubmission, state: string, jwtUtil: JwtUtil) {
        this.payload = payload;
        this.presentationSubmission = presentationSubmission;
        this.state = state;
        this.jwtUtil = jwtUtil;
    }

    /**
 * Sets the JWT header for the ID token request.
 * @param header - The JWT header to be used for signing the JWT.
 * @returns This instance for method chaining.
 */
    setHeader(header: JHeader): this {
        this.header = header;
        return this;
    }

    /**
     * Composes the token response and signs the JWT.
     * @returns The composed token response including the access token, token type, expiration time, ID token, nonce, and nonce expiration.
     */
    async compose(): Promise<VPTokenResponse> {
        // Sign the JWT
        const vpToken = await this.jwtUtil.sign(this.payload, this.header, 'ES256');

        if (typeof this.presentationSubmission !== 'object' || this.presentationSubmission === null) {
            throw new Error('Invalid presentationSubmission object');
        }

        // Stringify and encode the presentation submission
        const presentationSubmission = JSON.stringify(this.presentationSubmission);

        return {
            vp_token: vpToken,
            presentation_submission: presentationSubmission,
            state: this.state,
        } as VPTokenResponse;
    }
}