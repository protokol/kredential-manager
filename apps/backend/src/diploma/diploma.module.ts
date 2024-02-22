import { Module } from "@nestjs/common";
import { DiplomaController } from "./diploma.controller";
import { DiplomaService } from "./diploma.service";

@Module({
    controllers: [DiplomaController],
    providers: [DiplomaService],
})
export class DiplomaModule {}
