import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CredentialClaim, CredentialType, ClaimStatus } from '../entities/credential-claim.entity';
import { VcService } from '../vc/vc.service';
import { CredentialOfferService } from '../credential-offer/credential-offer.service';
import { GrantType } from 'src/credential-offer/credential-offer.type';

@Injectable()
export class InteropService {
    constructor(
        @InjectRepository(CredentialClaim)
        private claimRepo: Repository<CredentialClaim>,
        private vcService: VcService,
        private offerService: CredentialOfferService
    ) {}

    async createTestCredentials(holderDid: string) {
        const claims = [];
        
        for (const type of Object.values(CredentialType)) {
            console.log('type', type);
            try {
                const isDeferred = type.includes('Deferred');
                const isPreAuth = type.includes('PreAuthorised');
                
                const offer = await this.offerService.createOffer({
                    schemaTemplateId: 6,
                    credentialData: {
                        subjectDid: holderDid,
                        firstName: "Test",
                        lastName: "User",
                        studentID: "12345",
                        program: "Computer Science",
                        enrollmentDate: new Date().toISOString(),
                        graduationDate: new Date().toISOString(),
                        university: "Test University"
                    },
                    offerConfiguration: {
                        grantType: isPreAuth ? GrantType.PRE_AUTHORIZED_CODE : GrantType.AUTHORIZATION_CODE,
                        expiresIn: 3600
                    }
                });

                console.log('offer created:', offer);
                const formattedOffer = await this.offerService.formatOfferWithLinkAndQR(offer);
                console.log('formatted offer:', formattedOffer);

                const claim = await this.claimRepo.save({
                    holderDid,
                    credentialType: type,
                    status: ClaimStatus.PENDING,
                    qrCode: formattedOffer.qr_code,
                    offer: offer
                });

                claims.push({
                    ...claim,
                    offerUrl: `${process.env.ISSUER_BASE_URL}/credential-offer/${offer.id}`,
                    qrCode: formattedOffer.qr_code,
                    type,
                    preAuthorized: type.includes('PreAuthorised'),
                    deferred: type.includes('Deferred'),
                    pin: formattedOffer.pin
                });
            } catch (error) {
                console.error('Error creating offer:', error);
                throw error;
            }
        }

        return claims;
    }

    async getCredentialStatus(holderDid: string) {
        console.log('GET STATUS', holderDid);
        const claims = await this.claimRepo.find({
            where: { holderDid },
            order: { createdAt: 'DESC' }
        });

        return claims.map(claim => ({
            id: claim.id,
            credentialType: claim.credentialType,
            status: claim.status,
            claimedAt: claim.claimedAt,
            createdAt: claim.createdAt,
            preAuthorized: claim.credentialType.includes('PreAuthorised'),
            deferred: claim.credentialType.includes('Deferred')
        }));
    }

    async updateClaimStatus(id: string, status: ClaimStatus) {
        const claim = await this.claimRepo.findOne({ where: { id } });
        if (!claim) throw new Error('Claim not found');
        
        claim.status = status;
        if (status === ClaimStatus.CLAIMED) {
            claim.claimedAt = new Date();
        }
        
        return this.claimRepo.save(claim);
    }

    async findOne(options: FindOneOptions<CredentialClaim>) {
        return this.claimRepo.findOne(options);
    }
} 