import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags } from '@nestjs/swagger';
import { CredentialOfferService } from './credential-offer.service';
import { StudentService } from 'src/student/student.service';
import { VcService } from 'src/vc/vc.service';
import { DidService } from 'src/student/did.service';
import { CreateOfferDto } from './dto/createOfferDto';


@ApiTags('Offer')
@Controller('offer')
export class OfferController {
    constructor(private credentialOfferService: CredentialOfferService, private studentService: StudentService, private vcService: VcService, private didService: DidService) { }

    @Post()
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        console.log('createOfferDto', createOfferDto)
        console.log({ createOfferDto })
        const offer = await this.credentialOfferService.createOffer(createOfferDto);
        return {
            id: offer.id,
        };
    }
}