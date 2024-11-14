import { Module } from "@nestjs/common";
import { VcService } from "./vc.service";
import { VcController } from "./vc.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "@entities/did.entity";
import { IssuerService } from "./../issuer/issuer.service";
import { ApiKeyGuard } from "./../api-key/api-key.guard";

@Module({
    imports: [TypeOrmModule.forFeature([VerifiableCredential, Did])],
    exports: [TypeOrmModule],
    providers: [VcService, IssuerService],
    controllers: [VcController],
})
export class VcModule { }
