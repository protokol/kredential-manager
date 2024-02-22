import { Module } from "@nestjs/common";
import { VcService } from "./vc.service";
import { VcController } from "./vc.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";
import { Did } from "src/student/entities/did.entity";

@Module({
    imports: [TypeOrmModule.forFeature([VerifiableCredential, Did])],
    exports: [TypeOrmModule],
    providers: [VcService],
    controllers: [VcController],
})
export class VcModule {}
