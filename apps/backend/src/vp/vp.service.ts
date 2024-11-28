import { Injectable } from '@nestjs/common';
import { verifyCredentialJwt } from "@cef-ebsi/verifiable-credential";
import { EbsiConfigService } from '../network/ebsi-config.service';
import { PresentationSubmission, VPPayload } from '@protokol/kredential-core';
import { EbsiError } from '../error/ebsi-error';

@Injectable()
export class VpService {
    constructor(
        private readonly ebsiConfig: EbsiConfigService,
    ) { }

    async verifyVP(
        vpToken: string,
        presentationSubmission: PresentationSubmission,
        vpPayload: VPPayload
    ): Promise<void> {
        if (!vpPayload.vp.verifiableCredential || !Array.isArray(vpPayload.vp.verifiableCredential)) {
            throw new EbsiError(
                'invalid_request',
                'Invalid VP structure'
            );
        }

        for (let i = 0; i < vpPayload.vp.verifiableCredential.length; i++) {
            const vc = vpPayload.vp.verifiableCredential[i];
            const descriptorId = presentationSubmission.descriptor_map[i]?.id;

            await this.verifyCredential(vc, descriptorId);
        }
    }

    private async verifyCredential(vc: string, descriptorId: string): Promise<void> {
        try {
            const options = this.ebsiConfig.getVerifyCredentialOptions();
            const verifiedVc = await verifyCredentialJwt(vc, options);

            if (this.isCredentialRevoked(verifiedVc)) {
                throw new EbsiError(
                    'invalid_request',
                    `${descriptorId} is revoked`
                );
            }
        } catch (error) {
            if (error instanceof EbsiError) throw error;

            if (error.message.includes('expirationDate MUST be more recent than validFrom')) {
                throw new EbsiError(
                    'invalid_request',
                    `${descriptorId} is expired`
                );
            }

            if (error.message.includes('not yet valid')) {
                throw new EbsiError(
                    'invalid_request',
                    `${descriptorId} is not yet valid`
                );
            }

            throw new EbsiError(
                'invalid_request',
                `Error verifying credential ${descriptorId}: ${error.message}`
            );
        }
    }

    private isCredentialRevoked(verifiedVc: any): boolean {
        return verifiedVc.credentialStatus &&
            'statusPurpose' in verifiedVc.credentialStatus &&
            'statusListIndex' in verifiedVc.credentialStatus &&
            verifiedVc.credentialStatus.statusPurpose === 'revocation' &&
            verifiedVc.credentialStatus.statusListIndex === '7';
    }
}