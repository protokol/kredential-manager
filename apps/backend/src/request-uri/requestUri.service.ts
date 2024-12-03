import { Get, Injectable, Param } from "@nestjs/common";
import { generateRandomString } from "src/credential-offer/random";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { StateService } from "src/state/state.service";
import * as QRCode from 'qrcode';
import { EbsiError } from "src/error/ebsi-error";

@Injectable()
export class RequestUriService {
    constructor(
        private readonly presentationDefinitionService: PresentationDefinitionService,
        private readonly stateService: StateService,
    ) { }

    async createVerificationRequest(type: string) {
        // 1. Create the request parameters
        const VERIFIER_BASE_URL = process.env.ISSUER_BASE_URL;
        const id = 'j8wtVb-Jk2Q8-NyKE2PsxShSoLSboDSg';
        const state = generateRandomString(32);
        const request = {
            verifier_uri: `${VERIFIER_BASE_URL}`,
            response_type: 'vp_token',
            client_id: '',
            // redirect_uri: 'kredential://?callback',//`${process.env.ISSUER_BASE_URL}/direct_post`,
            // redirect_uri: 'https://api.eu-dev.protokol.sh/params',//`${process.env.ISSUER_BASE_URL}/direct_post`,
            redirect_uri: `${process.env.ISSUER_BASE_URL}/direct_post`,
            scope: 'openid',
            nonce: generateRandomString(32),
            state: state,
            presentationUri: `${process.env.ISSUER_BASE_URL}/presentation-definitions/definition/${id}`
        };

        // 2. Store state for later verification
        await this.stateService.createVerificationState(
            request.client_id,
            request.nonce,
            request.redirect_uri,
            request.scope,
            request.response_type,
            request.state,
            request.nonce,
            '',
            '',
            // request.state,
            // request.nonce,
            request.presentationUri
        );

        // 3. Create both URL and QR formats
        const verificationUrl = `kredential://?request_uri=${VERIFIER_BASE_URL}/request/request_uri/${state}`;

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

        const VERIFIER_BASE_URL = process.env.ISSUER_BASE_URL;
        return {
            verifier_uri: `${VERIFIER_BASE_URL}`,
            response_type: verificationState.responseType,
            client_id: verificationState.clientId,
            redirect_uri: verificationState.redirectUri,
            scope: verificationState.scope,
            nonce: verificationState.serverDefinedNonce,
            state: verificationState.serverDefinedState,
            presentation_uri: verificationState.presentationUri
        }
    };
}
