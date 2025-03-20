import { forwardRef, Module } from '@nestjs/common';
import { VpService } from './vp.service';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { EbsiConfigService } from 'src/network/ebsi-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import { CredentialOffer } from '@entities/credential-offer.entity';
import { VcModule } from 'src/vc/vc.module';

@Module({
  imports: [TypeOrmModule.forFeature([PresentationDefinition, CredentialOffer]),  forwardRef(() => VcModule)],
  providers: [VpService, PresentationDefinitionService, EbsiConfigService],
  exports: [VpService, PresentationDefinitionService, EbsiConfigService],

})
export class VpModule {} 