import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateService } from './state.service';
import { State } from '@entities/state.entity';
import { CredentialOffer } from '@entities/credential-offer.entity';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State, CredentialOffer, CredentialOfferData])],
  providers: [StateService],
  exports: [StateService]
})
export class StateModule {} 