import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialOffer } from '../entities/credential-offer.entity';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { CreateOfferDto, CreateOfferResponse, CredentialOfferResponse, GrantType } from './credential-offer.type';
import { IssuerService } from './../issuer/issuer.service';

@Injectable()
export class CredentialOfferService {
    constructor(
        @InjectRepository(CredentialOffer)
        private readonly credentialOfferRepository: Repository<CredentialOffer>,
        private readonly issuerService: IssuerService
    ) { }

    private generatePin(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private determineGrantType(credentialTypes: string[]): GrantType {
        console.log({ credentialTypes })
        const hasPreAuthorised = credentialTypes.some(type => type.includes('PreAuthorised'));
        return hasPreAuthorised ? GrantType.PRE_AUTHORIZED_CODE : GrantType.AUTHORIZATION_CODE;
    }

    async createOffer(createOfferDto: CreateOfferDto): Promise<CreateOfferResponse> {
        const { data, schemaId, grantType, trustFramework } = createOfferDto;
        const { did } = data;
        console.log({ did })

        // const credentialTypes = await this.credentialSchemaService.getCredentialTypes(schemaId);
        const credentialTypes = ["VerifiableCredential", "UniversityDegree"]
        const offerId = uuidv4();
        const pin = this.generatePin(); // Generate 6-digit PIN
        const effectiveGrantType = grantType || this.determineGrantType(credentialTypes);

        console.log({ credentialTypes })

        // Create base credential offer
        const credentialOffer: CredentialOfferResponse = {
            credential_issuer: process.env.ISSUER_BASE_URL,
            credentials: [{
                format: 'jwt_vc',
                types: credentialTypes,
                trust_framework: trustFramework || {
                    name: 'Evergreen Valley University',
                    type: 'Accreditation',
                    uri: 'https://evu.edu/accreditation'
                }
            }],
            grants: {}
        };

        let responsePin: string | undefined;
        // Add appropriate grant based on type
        if (grantType === GrantType.AUTHORIZATION_CODE) {
            const issuerState = await this.createJWT({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
                client_id: did,
                credential_types: credentialTypes,
                iss: process.env.ISSUER_URL,
                aud: process.env.AUTH_URL,
                sub: did
            });

            console.log(issuerState)
            credentialOffer.grants.authorization_code = {
                issuer_state: issuerState
            };
        } else {
            // For pre-authorized code, include the PIN in the JWT
            const preAuthCode = await this.createJWT({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 300,
                client_id: did,
                authorization_details: [{
                    type: 'openid_credential',
                    format: 'jwt_vc',
                    locations: [process.env.ISSUER_URL],
                    types: credentialTypes
                }],
                iss: process.env.ISSUER_URL,
                aud: process.env.AUTH_URL,
                sub: did
            });

            credentialOffer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'] = {
                'pre-authorized_code': preAuthCode,
                user_pin_required: true
            };

            responsePin = pin;
        }

        // Save the offer with PIN
        const offer = this.credentialOfferRepository.create({
            id: offerId,
            did,
            credential_types: credentialTypes,
            credential_offer: credentialOffer,
            grant_type: effectiveGrantType,
            pin: pin,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 300000) // 5 minutes
        });

        await this.credentialOfferRepository.save(offer);

        // Return the offer and PIN (if pre-authorized)
        return {
            id: offerId,
            credential_offer: credentialOffer,
            pin: effectiveGrantType === GrantType.PRE_AUTHORIZED_CODE ? pin : undefined
        };
    }

    async verifyPreAuthorizedCodeAndPin(preAuthorizedCode: string, pin: string): Promise<boolean> {
        const offer = await this.credentialOfferRepository.findOne({
            where: {
                pin,
                status: 'PENDING'
            }
        });

        if (!offer) {
            throw new UnauthorizedException('Invalid pre-authorized code or PIN');
        }

        const preAuthGrant = offer.credential_offer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'];
        if (!preAuthGrant || preAuthGrant['pre-authorized_code'] !== preAuthorizedCode) {
            throw new UnauthorizedException('Invalid pre-authorized code');
        }

        if (offer.expires_at < new Date()) {
            throw new UnauthorizedException('Pre-authorized code has expired');
        }

        return true;
    }

    async findOfferByPreAuthorizedCodeAndPin(preAuthorizedCode: string, pin: string): Promise<CredentialOffer> {
        const offers = await this.credentialOfferRepository.find({
            where: {
                pin
            }
        });

        const offer = offers.find(o =>
            o.credential_offer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.['pre-authorized_code'] === preAuthorizedCode
        );

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        return offer;
    }

    async verifyPin(offerId: string, providedPin: string): Promise<boolean> {
        const offer = await this.credentialOfferRepository.findOne({
            where: { id: offerId }
        });

        if (!offer) {
            throw new BadRequestException('Offer not found');
        }

        if (offer.expires_at < new Date()) {
            throw new BadRequestException('Offer has expired');
        }

        return offer.pin === providedPin;
    }

    async getOfferById(id: string): Promise<CredentialOfferResponse> {
        const offer = await this.credentialOfferRepository.findOne({
            where: {
                id,
                status: 'PENDING'
            }
        });

        if (!offer) {
            throw new BadRequestException('Offer not found');
        }

        if (offer.expires_at < new Date()) {
            throw new BadRequestException('Offer has expired');
        }

        this.credentialOfferRepository.update(id, { status: 'USED' });
        return offer.credential_offer as CredentialOfferResponse;
    }

    private async createJWT(payload: any): Promise<string> {
        return this.issuerService.getJwtUtil().sign(payload, {}, 'ES256');
    }
}