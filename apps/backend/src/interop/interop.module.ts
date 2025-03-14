import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteropService } from './interop.service';
import { InteropController } from './interop.controller';
import { CredentialClaim } from '../entities/credential-claim.entity';
import { VcModule } from '../vc/vc.module';
import { CredentialOfferModule } from '../credential-offer/credential-offer.module';
import { CredentialStatusModule } from 'src/credential-status/credential-status.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialClaim]),
        forwardRef(() => VcModule),
        forwardRef(() => CredentialOfferModule),
        CredentialStatusModule
    ],
    providers: [InteropService],
    controllers: [InteropController]
})
export class InteropModule {} 