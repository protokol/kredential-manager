import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialOfferController } from './credential-offer.controller';
import { CredentialOfferService } from './credential-offer.service';
import { CredentialOffer } from '../entities/credential-offer.entity';
import { ApiKeyModule } from '../api-key/api-key.module';
import { Did } from '@entities/did.entity';
import { DidService } from './../student/did.service';
import { IssuerService } from './../issuer/issuer.service';
import { SchemaTemplateService } from 'src/schemas/schema-template.service';
import { CredentialSchema } from '@entities/credential-schema.entity';
import { SchemaTemplateModule } from 'src/schemas/schema-template.module';
import { StateService } from 'src/state/state.service';
import { State } from '@entities/state.entity';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialOffer, Did, CredentialSchema, State, PresentationDefinition, CredentialOfferData]),
        ApiKeyModule,
        SchemaTemplateModule
    ],
    controllers: [CredentialOfferController],
    providers: [CredentialOfferService, DidService, IssuerService, SchemaTemplateService, StateService, PresentationDefinitionService],
    exports: [TypeOrmModule]
})
export class CredentialOfferModule { }