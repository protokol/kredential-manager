import { Module } from "@nestjs/common";
import { VcService } from "./vc.service";
import { VcController } from "./vc.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";

@Module({
    imports: [TypeOrmModule.forFeature([VerifiableCredential])],
    exports: [TypeOrmModule],
    providers: [VcService],
    controllers: [VcController],
})
export class VcModule { }
