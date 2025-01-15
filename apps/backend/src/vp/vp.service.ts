import { Injectable } from '@nestjs/common';
import { verifyCredentialJwt } from "@cef-ebsi/verifiable-credential";
import { EbsiConfigService } from '../network/ebsi-config.service';
import { PresentationSubmission, VPPayload } from '@protokol/kredential-core';
import { EbsiError } from '../error/ebsi-error';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import * as zlib from 'zlib';
@Injectable()
export class VpService {
    constructor(
        private readonly ebsiConfig: EbsiConfigService,
        private readonly presentationDefinitionService: PresentationDefinitionService,
    ) { }

    async verifyVP(
        vpToken: string,
        presentationDefinition: PresentationDefinition,
        presentationSubmission: PresentationSubmission,
        vpPayload: VPPayload,
    ): Promise<void> {
        if (!vpPayload.vp.verifiableCredential || !Array.isArray(vpPayload.vp.verifiableCredential)) {
            throw new EbsiError(
                'invalid_request',
                'Invalid VP structure'
            );
        }


        const submissionRequirements = presentationDefinition?.definition?.submission_requirements || [];

        for (const requirement of submissionRequirements) {
            const descriptors = presentationSubmission.descriptor_map.filter(descriptor => descriptor.id === requirement.from);
            if (requirement.rule === 'all' && descriptors.length < requirement.count) {
                throw new EbsiError(
                    'invalid_request',
                    `Submission requirement not met: ${requirement.name || requirement.from}`
                );
            } else if (requirement.rule === 'pick' && descriptors.length < requirement.count) {
                throw new EbsiError(
                    'invalid_request',
                    `Not enough descriptors picked for: ${requirement.name || requirement.from}`
                );
            }
        }

        for (let i = 0; i < vpPayload.vp.verifiableCredential.length; i++) {
            const vc = vpPayload.vp.verifiableCredential[i];
            const descriptorId = presentationSubmission.descriptor_map[i]?.id;
            await this.verifyCredential(vc, descriptorId);
        }
    }

    async verifyCredential(vc: string, descriptorId: string): Promise<void> {
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

    private async isCredentialRevoked(verifiedVc: any): Promise<boolean> {
        if (!verifiedVc.credentialStatus ||
            !verifiedVc.credentialStatus.statusPurpose ||
            !verifiedVc.credentialStatus.statusListIndex ||
            !verifiedVc.credentialStatus.statusListCredential ||
            verifiedVc.credentialStatus.statusPurpose !== 'revocation') {
            return false;
        }

        try {
            // Fetch the status list
            const response = await fetch(verifiedVc.credentialStatus.statusListCredential);
            if (!response.ok) {
                throw new Error('Failed to fetch status list');
            }

            // Get the encoded list
            const statusList = await response.json();
            const encodedList = statusList.credentialSubject.encodedList;

            // Decode and check the bit
            const compressed = Buffer.from(encodedList, 'base64');
            const bitArray = new Uint8Array(zlib.gunzipSync(compressed));
            const index = parseInt(verifiedVc.credentialStatus.statusListIndex);

            return bitArray[index] === 1;  // true = revoked, false = valid
        } catch (error) {
            console.error('Error checking revocation status:', error);
            throw error;
        }
    }
}