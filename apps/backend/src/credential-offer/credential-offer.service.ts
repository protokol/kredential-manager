import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialOffer } from '../entities/credential-offer.entity';
import { v4 as uuidv4 } from 'uuid';
import { CredentialOfferDetailsResponse, CredentialOfferStatus, CredentialOfferWithQRAndLink, GrantType } from './credential-offer.type';
import { IssuerService } from './../issuer/issuer.service';
import { SchemaTemplateService } from 'src/schemas/schema-template.service';
import { CreateOfferDto } from './dto/createOfferDto';
import { StateService } from 'src/state/state.service';
import { OfferConfigurationDto } from './dto/offerConfigurationDto';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';
import { VerificationService } from 'src/verification/verification.service';
import * as QRCode from 'qrcode';

@Injectable()
export class CredentialOfferService {
    private readonly DEFAULT_EXPIRATION_TIME = 30 * 24 * 60 * 60; // in seconds
    constructor(
        @InjectRepository(CredentialOffer)
        private readonly credentialOfferRepository: Repository<CredentialOffer>,
        private readonly schemaTemplateService: SchemaTemplateService,
        private readonly issuerService: IssuerService,
        private readonly state: StateService,
        @InjectRepository(CredentialOfferData)
        private readonly credentialOfferDataRepository: Repository<CredentialOfferData>,
        private readonly presentationDefinitionService: PresentationDefinitionService,
        private readonly verificationService: VerificationService
    ) { }

    private generatePin(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }


    private async generateOffer(
        schema: any,
        credentialData: Record<string, any>,
        offerConfiguration: OfferConfigurationDto,
        status: string = 'PENDING'
    ): Promise<CredentialOffer> {
        const { subjectDid } = credentialData;
        const { grantType, expiresIn, scope } = offerConfiguration;
        const credentialTypes = schema.schema.type;
        const trustFramework = await this.schemaTemplateService.getTrustFramework(schema.id);
        if (scope) {
            const scopeExists = await this.presentationDefinitionService.getByScope(scope);
            if (!scopeExists) {
                throw new BadRequestException('Invalid scope');
            }
        }

        const offerId = uuidv4();
        const pin = grantType === GrantType.PRE_AUTHORIZED_CODE ? this.generatePin() : null;
        const expirationInSeconds = expiresIn ?? this.DEFAULT_EXPIRATION_TIME;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const expiresAtInSeconds = currentTimeInSeconds + expirationInSeconds;
        let issuerState: string | null = null;

        // Create base credential offer
        const credentialOffer: CredentialOfferDetailsResponse = {
            credential_issuer: process.env.ISSUER_BASE_URL,
            credentials: [{
                format: 'jwt_vc',
                types: credentialTypes,
                trust_framework: trustFramework
            }],
            grants: {}
        };

        // Add appropriate grant
        if (grantType === GrantType.PRE_AUTHORIZED_CODE) {
            const preAuthCode = await this.createPreAuthCode(subjectDid, credentialTypes, expiresIn);
            credentialOffer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'] = {
                'pre-authorized_code': preAuthCode,
                user_pin_required: true,
                scope
            };
        } else {
            issuerState = await this.createIssuerState(subjectDid, credentialTypes, scope, expiresIn);
            credentialOffer.grants.authorization_code = { issuer_state: issuerState, scope };
        }

        const credentialOfferData = await this.credentialOfferDataRepository.save(
            this.credentialOfferDataRepository.create({
                templateData: credentialData,
                schemaTemplateId: schema.id,
            })
        );

        // Create and save offer
        const offer = await this.credentialOfferRepository.save(
            this.credentialOfferRepository.create({
                id: offerId,
                subject_did: subjectDid,
                credential_types: credentialTypes,
                credential_offer_details: credentialOffer,
                grant_type: grantType,
                pin,
                status: status,
                expires_at: new Date(expiresAtInSeconds * 1000),
                credential_offer_data: credentialOfferData,
                issuer_state: issuerState
            })
        );

        // Store state for pre-authorized code
        if (grantType === GrantType.PRE_AUTHORIZED_CODE) {
            await this.state.createPreAuthorisedAndPinCode(
                pin,
                credentialOffer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code'],
                subjectDid,
                credentialTypes,
                offer
            );
        }

        return offer;
    }

    private async createPreAuthCode(
        subjectDid: string,
        credentialTypes: string[],
        expiresIn?: number
    ): Promise<string> {
        return await this.createJWT({
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (expiresIn ?? this.DEFAULT_EXPIRATION_TIME),
            client_id: subjectDid,
            authorization_details: [{
                type: 'openid_credential',
                format: 'jwt_vc',
                locations: [process.env.ISSUER_URL],
                types: credentialTypes
            }],
            iss: process.env.ISSUER_URL,
            aud: process.env.AUTH_URL,
            sub: subjectDid
        });
    }

    async createOffer(createOfferDto: CreateOfferDto, offerStatus: string = 'PENDING'): Promise<CredentialOffer> {
        const { schemaTemplateId, credentialData, offerConfiguration } = createOfferDto;

        // Validate and get schema
        const schema = await this.validateAndGetSchema(schemaTemplateId, credentialData);

        // Generate and store the offer
        const offer = await this.generateOffer(schema, credentialData, offerConfiguration, offerStatus);

        return offer;
    }

    async createOfferWithLingAndQR(createOfferDto: CreateOfferDto): Promise<CredentialOfferWithQRAndLink> {
        const offer = await this.createOffer(createOfferDto);
        // Create the offer URI
        const offerUrl = `${process.env.ISSUER_BASE_URL}/credential-offer/${offer.id}`;
        const encodedUrl = encodeURIComponent(offerUrl);
        const offerUri = `openid-credential-offer://?credential_offer_uri=${encodedUrl}`;

        // Generate QR code
        const qrCode = await QRCode.toDataURL(offerUri);

        return {
            id: offer.id,
            credential_offer_details: offer.credential_offer_details,
            pin: offer.pin,
            offer_uri: offerUri,
            qr_code: qrCode
        };
    }

    /**
     * Validates the schema and returns the schema
     * @param schemaTemplateId 
     * @param data 
     * @returns 
     */
    private async validateAndGetSchema(schemaTemplateId: number, data: Record<string, any>) {
        const validationResult = await this.verificationService.validateData(schemaTemplateId, data);
        if (!validationResult.isValid) {
            throw new BadRequestException(validationResult.errors);
        }
        return await this.schemaTemplateService.findOne(schemaTemplateId);
    }

    /**
     * Gets an offer by issuer state
     * @param issuerState 
     * @returns 
     */
    async getOfferByIssuerState(issuerState: string): Promise<CredentialOffer> {
        const offer = await this.credentialOfferRepository.findOne({
            where: { issuer_state: issuerState }
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        return offer;
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

        const preAuthGrant = offer.credential_offer_details.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'];
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
            o.credential_offer_details.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.['pre-authorized_code'] === preAuthorizedCode
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

        if (this.isOfferExpired(offer)) {
            throw new BadRequestException('Offer has expired');
        }

        return offer.pin === providedPin;
    }

    async getById(id: string): Promise<CredentialOffer> {
        return await this.credentialOfferRepository.findOne({
            where: {
                id
            }
        });
    }

    async getOfferById(id: string): Promise<CredentialOfferDetailsResponse> {
        const offer = await this.credentialOfferRepository.findOne({
            where: {
                id
            }
        });

        if (!offer) {
            throw new BadRequestException('Offer not found');
        }
        if (this.isOfferExpired(offer)) {
            throw new BadRequestException('Offer has expired');
        }

        this.credentialOfferRepository.update(id, { status: 'USED' });
        return offer.credential_offer_details as CredentialOfferDetailsResponse;
    }

    private async createIssuerState(
        subjectDid: string,
        credentialTypes: string[],
        scope: string,
        expiresIn?: number
    ): Promise<string> {
        return await this.createJWT({
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (expiresIn ?? this.DEFAULT_EXPIRATION_TIME),
            client_id: subjectDid,
            credential_types: credentialTypes,
            scope,
            iss: process.env.ISSUER_URL,
            aud: process.env.AUTH_URL,
            sub: subjectDid
        });
    }

    private async createJWT(payload: any): Promise<string> {
        return this.issuerService.getJwtUtil().sign(payload, {}, 'ES256');
    }

    private isOfferExpired(offer: CredentialOffer): boolean {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const expiresAtInSeconds = Math.floor(offer.expires_at.getTime() / 1000);
        return expiresAtInSeconds <= nowInSeconds;
    }

    async listOffers(): Promise<CredentialOffer[]> {
        return await this.credentialOfferRepository.find();
    }

    async deleteOffer(id: string): Promise<void> {
        const result = await this.credentialOfferRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Offer not found');
        }
    }
}