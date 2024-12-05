import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaTemplateController } from './schema-template.controller';
import { SchemaTemplateService } from './schema-template.service';
import { CredentialSchema } from '@entities/credential-schema.entity';
import { IssuerService } from 'src/issuer/issuer.service';
import { PresentationDefinition } from '@entities/presentation-definition.entity';
import { VerificationService } from 'src/verification/verification.service';
import { VpService } from 'src/vp/vp.service';
import { VcService } from 'src/vc/vc.service';
import { EbsiConfigService } from 'src/network/ebsi-config.service';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { VerifiableCredential } from '@entities/verifiableCredential.entity';
import { Did } from '@entities/did.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialSchema, PresentationDefinition, VerifiableCredential, Did])
    ],
    providers: [SchemaTemplateService, IssuerService, VerificationService, VpService, VcService, EbsiConfigService, PresentationDefinitionService],
    controllers: [SchemaTemplateController],
    exports: [SchemaTemplateService]
})
export class SchemaTemplateModule { }