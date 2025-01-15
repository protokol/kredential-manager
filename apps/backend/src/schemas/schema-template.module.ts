import { Module, forwardRef } from '@nestjs/common';
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
import { OpenIDProviderService } from 'src/openId/openId.service';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { CredentialStatusModule } from 'src/credential-status/credential-status.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialSchema, PresentationDefinition, VerifiableCredential, Did]),
        ApiKeyModule,
        forwardRef(() => CredentialStatusModule)
    ],
    providers: [SchemaTemplateService, IssuerService, VerificationService, VpService, VcService, EbsiConfigService, PresentationDefinitionService, OpenIDProviderService],
    controllers: [SchemaTemplateController],
    exports: [SchemaTemplateService]
})
export class SchemaTemplateModule { }