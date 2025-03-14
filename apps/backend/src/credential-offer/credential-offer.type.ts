import { ApiProperty } from "@nestjs/swagger";
import { Type } from "ajv/dist/compile/util";
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Validate, ValidateNested } from "class-validator";
import { SchemaTemplateData } from "src/schemas/schema.types";

export enum CredentialOfferStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired'
}


export interface TrustFramework {
    name: string;
    type: string;
    uri: string;
}

export interface CredentialFormat {
    format: string;
    types: string[];
    trust_framework?: TrustFramework;
}

export interface AuthorizationCodeGrant {
    issuer_state: string;
    scope?: string;
}

export interface PreAuthorizedCodeGrant {
    'pre-authorized_code': string;
    user_pin_required: boolean;
    scope?: string;
}

export interface CredentialOfferDetailsResponse {
    credential_issuer: string;
    credentials: CredentialFormat[];
    grants: {
        'authorization_code'?: AuthorizationCodeGrant;
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: PreAuthorizedCodeGrant;
    };
}

export interface CreateOfferResponse {
    id: string;
    credential_offer_details: CredentialOfferDetailsResponse;
    pin?: string;
}

export enum GrantType {
    AUTHORIZATION_CODE = 'authorization_code',
    PRE_AUTHORIZED_CODE = 'urn:ietf:params:oauth:grant-type:pre-authorized_code'
}

export class TrustFrameworkDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    uri: string;
}

export interface AuthorizationCodeGrant {
    issuer_state: string;
}

export interface PreAuthorizedCodeGrant {
    'pre-authorized_code': string;
    user_pin_required: boolean;
}

export interface CredentialOfferDetails {
    credential_issuer: string;
    credentials: CredentialFormat[];
    grants: {
        'authorization_code'?: AuthorizationCodeGrant;
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: PreAuthorizedCodeGrant;
    };
}

export interface CredentialOfferWithQRAndLink {
    id: string;
    credential_offer_details: CredentialOfferDetailsResponse;
    pin?: string;
    offer_uri: string;
    qr_code: string;
    credential_offer?: any;
}