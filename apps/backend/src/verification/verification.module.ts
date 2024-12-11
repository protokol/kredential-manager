import { TypeOrmModule } from "@nestjs/typeorm";
import { VerificationController } from "./verification.controller";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        TypeOrmModule.forFeature([])
    ],
    providers: [],
    controllers: [VerificationController],
    exports: [VerificationController]
})
export class VerificationModule { }