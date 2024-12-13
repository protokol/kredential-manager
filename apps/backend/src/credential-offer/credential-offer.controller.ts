import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ApiKeyGuard } from './../api-key/api-key.guard';
import { CredentialOfferService } from './credential-offer.service';
import { CreateOfferDto } from './dto/createOfferDto';

@Controller('credential-offer')
@ApiTags('Credential Offer')
export class CredentialOfferController {
    constructor(private credentialOfferService: CredentialOfferService) { }

    @Post()
    @Public()
    @ApiOperation({ summary: 'Create a credential offer' })
    @UseGuards(ApiKeyGuard)
    @ApiHeader({
        name: 'x-api-key',
        description: 'API key for credential offer generation'
    })
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        return await this.credentialOfferService.createOfferWithLingAndQR(createOfferDto);
    }

    @Post(':id/verify-pin')
    @Public()
    @ApiOperation({ summary: 'Verify PIN for a credential offer' })
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
    @ApiOperation({ summary: 'Get a credential offer by ID' })
    async getOffer(@Param('id') id: string) {
        return await this.credentialOfferService.getOfferById(id);
    }
}