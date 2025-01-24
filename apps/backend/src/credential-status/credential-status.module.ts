import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialStatusService } from './credential-status.service';
import { CredentialStatusController } from './credential-status.controller';
import { CredentialStatusList } from '../entities/credential-status-list.entity';
import { CredentialStatusEntry } from '../entities/credential-status-entry.entity';
import { VcModule } from '../vc/vc.module';
import { IssuerService } from '../issuer/issuer.service';
import { VerifiableCredential } from '@entities/verifiableCredential.entity';
import { Did } from '@entities/did.entity';
import { VcService } from 'src/vc/vc.service';
import { SchemaTemplateService } from 'src/schemas/schema-template.service';
import { SchemaTemplateModule } from 'src/schemas/schema-template.module';
import { EbsiConfigService } from 'src/network/ebsi-config.service';
import { VpService } from 'src/vp/vp.service';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { Student } from '@entities/student.entity';
import { CredentialOffer } from '@entities/credential-offer.entity';
import { CredentialOfferData } from '@entities/credential-offer-data.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CredentialStatusList,
            CredentialStatusEntry,
            VerifiableCredential,
            Did,
            Student,
            CredentialOffer,
            CredentialOfferData
        ]),
        forwardRef(() => VcModule),
        forwardRef(() => SchemaTemplateModule)
    ],
    providers: [
        CredentialStatusService,
        IssuerService,
        VcService,
        SchemaTemplateService,
        EbsiConfigService,
        VpService,
        PresentationDefinitionService
    ],
    controllers: [CredentialStatusController],
    exports: [CredentialStatusService]
})
export class CredentialStatusModule { } 