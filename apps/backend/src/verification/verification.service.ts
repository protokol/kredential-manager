import { Get, Injectable, Param } from "@nestjs/common";
import { generateRandomString } from "src/credential-offer/random";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { StateService } from "src/state/state.service";
import * as QRCode from 'qrcode';
import { EbsiError } from "src/error/ebsi-error";

@Injectable()
export class VerificationService {
    constructor(
        private readonly presentationDefinitionService: PresentationDefinitionService,
        private readonly stateService: StateService,
    ) { }

    async createVerificationRequest(type: string, clientId: string) {
        // 1. Create the request parameters
        const request = {
            response_type: 'vp_token',
            client_id: clientId,
            redirect_uri: `${process.env.ISSUER_BASE_URL}/direct_post`,
            scope: 'openid',
            nonce: generateRandomString(32),
            state: generateRandomString(32),
            presentationUri: `${process.env.ISSUER_BASE_URL}/presentation-definitions/definition/${type}`
        };

        // 2. Store state for later verification
        await this.stateService.createVerificationState(request.client_id, request.nonce, request.redirect_uri, request.scope, request.response_type, request.state, request.nonce, request.state, request.nonce, request.presentationUri);


        // 3. Create both URL and QR formats
        const verificationUrl = `kredential://?request_uri=${encodeURIComponent(
            `${process.env.ISSUER_BASE_URL}/verification/request/${request.state}`
        )}`;

        return {
            url: verificationUrl,
            qrCode: await QRCode.toDataURL(verificationUrl),
            state: request.state
        };
    }

    @Get('verification-request/:state')
    async getVerificationRequest(@Param('state') state: string) {
        const verificationState = await this.stateService.getVerificationStateByState(state);
        if (!verificationState) {
            throw new EbsiError('invalid_request', 'Invalid verification state');
        }

        return {
            response_type: 'vp_token',
            client_id: process.env.VERIFIER_CLIENT_ID,
            redirect_uri: `${process.env.VERIFIER_BASE_URL}/direct_post`,
            scope: 'openid',
            nonce: verificationState.cNonce,
            state: verificationState.serverDefinedState,
            presentationUri: verificationState.presentationUri
        };
    }
}