import { Controller, Post, Get, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CredentialOfferService } from './credential-offer.service';
import { StudentService } from 'src/student/student.service';
import { VcService } from 'src/vc/vc.service';
import { DidService } from 'src/student/did.service';
import { CreateOfferDto } from './dto/createOfferDto';
import { handleError } from 'src/error/ebsi-error.util';


@ApiTags('Offer')
@Controller('offer')
export class OfferController {
    constructor(private credentialOfferService: CredentialOfferService, private studentService: StudentService, private vcService: VcService, private didService: DidService) { }

    @Post()
    @ApiOperation({ summary: 'Create a credential offer' })
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        return await this.credentialOfferService.createOfferWithLingAndQR(createOfferDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all credential offers' })
    async listOffers() {
        return await this.credentialOfferService.listOffers();
    }


    @Delete(':id')
    @ApiOperation({ summary: 'Delete a credential offer' })
    async deleteOffer(@Param('id') id: string) {
        try {
            await this.credentialOfferService.deleteOffer(id);
            return { message: 'Offer deleted successfully' };
        } catch (error) {
            throw handleError(error);
        }
    }
}