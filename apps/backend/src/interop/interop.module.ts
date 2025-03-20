import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteropService } from './interop.service';
import { InteropController } from './interop.controller';
import { CredentialClaim } from '../entities/credential-claim.entity';
import { VcModule } from '../vc/vc.module';
import { CredentialOfferModule } from '../credential-offer/credential-offer.module';
import { CredentialStatusModule } from 'src/credential-status/credential-status.module';
import { PresentationDefinitionModule } from 'src/presentation/presentation-definition.module';
import { VpModule } from 'src/vp/vp.module';
import { StateModule } from 'src/state/state.module';
import { SchemaTemplateModule } from 'src/schemas/schema-template.module';
import { ScopeCredentialMappingService } from 'src/scope-mapping/scope-mapping.service';
import { ScopeCredentialMapping } from '@entities/scope-credential-mapping.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialClaim, ScopeCredentialMapping]),
        forwardRef(() => VcModule),
        forwardRef(() => CredentialOfferModule),
        CredentialStatusModule,
        PresentationDefinitionModule,
        VpModule,
        StateModule,
        SchemaTemplateModule
    ],
    providers: [InteropService, ScopeCredentialMappingService],
    controllers: [InteropController],
    exports: [InteropService]
})
export class InteropModule {} 