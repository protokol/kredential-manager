import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { ApiKeyGuard } from './../api-key/api-key.guard';
import { CredentialOfferService } from './credential-offer.service';
import * as QRCode from 'qrcode';
import { CreateOfferDto } from './dto/createOfferDto';

@Controller('credential-offer')
@ApiTags('Credential Offer')
export class CredentialOfferController {
    constructor(private credentialOfferService: CredentialOfferService) { }

    @Post()
    @Public()
    @UseGuards(ApiKeyGuard)
    @ApiHeader({
        name: 'x-api-key',
        description: 'API key for credential offer generation'
    })
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        console.log('createOfferDto', createOfferDto)
        console.log({ createOfferDto })
        const offer = await this.credentialOfferService.createOffer(createOfferDto);

        // Create the offer URI
        const offerUrl = `${process.env.ISSUER_BASE_URL}/credential-offer/${offer.id}`;
        const encodedUrl = encodeURIComponent(offerUrl);
        const offerUri = `openid-credential-offer://?credential_offer_uri=${encodedUrl}`;

        // Generate QR code
        const qrCode = await QRCode.toDataURL(offerUri);

        return {
            ...offer,
            offer_uri: offerUri,
            qr_code: qrCode
        };
    }

    @Post(':id/verify-pin')
    @Public()
    async verifyPin(
        @Param('id') id: string,
        @Body() body: { pin: string }
    ) {
        return {
            valid: await this.credentialOfferService.verifyPin(id, body.pin)
        };
    }

    @Get(':id')
    @Public()
    async getOffer(@Param('id') id: string) {
        return await this.credentialOfferService.getOfferById(id);
    }
}