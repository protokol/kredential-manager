import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialOffer } from '../entities/credential-offer.entity';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { CreateOfferResponse, CredentialOfferDetailsResponse, GrantType } from './credential-offer.type';
import { IssuerService } from './../issuer/issuer.service';
import { SchemaTemplateService } from 'src/schemas/schema-template.service';
import { CreateOfferDto } from './dto/createOfferDto';
import { StateService } from 'src/state/state.service';
import { StateStatus } from 'src/state/enum/status.enum';
import { OfferConfigurationDto } from './dto/offerConfigurationDto';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';

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
        private readonly credentialOfferDataRepository: Repository<CredentialOfferData>
    ) { }

    private generatePin(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private determineGrantType(credentialTypes: string[]): GrantType {
        console.log({ credentialTypes })
        const hasPreAuthorised = credentialTypes.some(type => type.includes('PreAuthorised'));
        return hasPreAuthorised ? GrantType.PRE_AUTHORIZED_CODE : GrantType.AUTHORIZATION_CODE;
    }

    private async generateOffer(
        schema: any,
        credentialData: Record<string, any>,
        offerConfiguration: OfferConfigurationDto
    ): Promise<CredentialOffer> {
        const { subjectDid } = credentialData;
        const { grantType, expiresIn } = offerConfiguration;
        const credentialTypes = schema.schema.type;
        const trustFramework = await this.schemaTemplateService.getTrustFramework(schema.id);

        const offerId = uuidv4();
        const pin = grantType === GrantType.PRE_AUTHORIZED_CODE ? '1' : null; // TODO: this.generatePin();
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
                user_pin_required: true
            };
        } else {
            issuerState = await this.createIssuerState(subjectDid, credentialTypes, expiresIn);
            credentialOffer.grants.authorization_code = { issuer_state: issuerState };
        }

        console.log('SCHEMA', schema)
        console.log('CREDENTIAL DATA', credentialData)

        const credentialOfferData = await this.credentialOfferDataRepository.save(
            this.credentialOfferDataRepository.create({
                templateData: credentialData,
                schemaTemplateId: schema.id
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
                status: 'PENDING',
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

    async createOffer(createOfferDto: CreateOfferDto): Promise<CreateOfferResponse> {
        const { schemaTemplateId, credentialData, offerConfiguration } = createOfferDto;

        // Validate and get schema
        const schema = await this.validateAndGetSchema(schemaTemplateId, credentialData);

        // Generate and store the offer
        const offer = await this.generateOffer(schema, credentialData, offerConfiguration);

        return {
            id: offer.id,
            credential_offer_details: offer.credential_offer_details,
            pin: offer.pin
        };
    }

    /**
     * Validates the schema and returns the schema
     * @param schemaTemplateId 
     * @param data 
     * @returns 
     */
    private async validateAndGetSchema(schemaTemplateId: number, data: Record<string, any>) {
        const validationResult = await this.schemaTemplateService.validateData(schemaTemplateId, data);
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
            where: { issuer_state: issuerState },
            relations: ['credential_offer_data']
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        return offer;
    }

    /**
     * Creates an offer
     * @param createOfferDto 
     * @returns 
     */
    async createOfferOLD(createOfferDto: CreateOfferDto): Promise<CreateOfferResponse> {
        const { schemaTemplateId, credentialData, offerConfiguration } = createOfferDto;
        const { subjectDid } = credentialData;
        const { grantType, expiresIn } = offerConfiguration;

        const validationResult = await this.schemaTemplateService.validateData(schemaTemplateId, credentialData);
        if (!validationResult.isValid) {
            throw new BadRequestException(validationResult.errors);
        }

        const schema = await this.schemaTemplateService.findOne(schemaTemplateId)
        const trustFramework = await this.schemaTemplateService.getTrustFramework(schema.id);
        const credentialTypes = schema.schema.type

        const offerId = uuidv4();
        const pin = '1'; //this.generatePin();
        const effectiveGrantType = grantType || this.determineGrantType(credentialTypes);

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

        let responsePin: string | undefined;
        // Add appropriate grant based on type
        if (grantType === GrantType.AUTHORIZATION_CODE) {
            const issuerState = await this.createJWT({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (expiresIn ?? this.DEFAULT_EXPIRATION_TIME),
                client_id: subjectDid,
                credential_types: credentialTypes,
                iss: process.env.ISSUER_URL,
                aud: process.env.AUTH_URL,
                sub: subjectDid
            });

            credentialOffer.grants.authorization_code = {
                issuer_state: issuerState
            };
        } else {
            // For pre-authorized code, include the PIN in the JWT
            const preAuthCode = await this.createJWT({
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

            await this.state.createPreAuthorisedAndPinCode(pin, preAuthCode, subjectDid, credentialTypes);

            credentialOffer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'] = {
                'pre-authorized_code': preAuthCode,
                user_pin_required: true
            };

            responsePin = pin;
        }

        const expirationInSeconds = expiresIn ?? this.DEFAULT_EXPIRATION_TIME;
        // Save the offer with PIN
        const offer = this.credentialOfferRepository.create({
            id: offerId,
            subject_did: subjectDid,
            credential_types: credentialTypes,
            credential_offer_details: credentialOffer,
            grant_type: effectiveGrantType,
            pin: pin,
            status: 'PENDING',
            expires_at: new Date(Date.now() + expirationInSeconds * 1000)
        });

        // Save the offer
        await this.credentialOfferRepository.save(offer);

        // Return the offer and PIN (if pre-authorized)
        return {
            id: offerId,
            credential_offer_details: credentialOffer,
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

    async getOfferById(id: string): Promise<CredentialOfferDetailsResponse> {
        const offer = await this.credentialOfferRepository.findOne({
            where: {
                id,
                status: 'PENDING'
            }
        });

        console.log({ offer })

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
        expiresIn?: number
    ): Promise<string> {
        return await this.createJWT({
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (expiresIn ?? this.DEFAULT_EXPIRATION_TIME),
            client_id: subjectDid,
            credential_types: credentialTypes,
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

        console.log(expiresAtInSeconds, '<', nowInSeconds)

        return expiresAtInSeconds <= nowInSeconds;
    }
}