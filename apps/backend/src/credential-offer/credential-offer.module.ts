import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialOfferController } from './credential-offer.controller';
import { CredentialOfferService } from './credential-offer.service';
import { CredentialOffer } from '../entities/credential-offer.entity';
import { ApiKeyModule } from '../api-key/api-key.module';
import { DidModule } from './../student/did.module';
import { Did } from '@entities/did.entity';
import { DidService } from './../student/did.service';
import { IssuerService } from './../issuer/issuer.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialOffer, Did]),
        ApiKeyModule
    ],
    controllers: [CredentialOfferController],
    providers: [CredentialOfferService, DidService, IssuerService],
    exports: [TypeOrmModule]
})
export class CredentialOfferModule { }