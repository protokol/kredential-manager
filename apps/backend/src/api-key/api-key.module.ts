import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "../entities/student.entity";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "../entities/did.entity";
import { ApiKeyService } from "./api-key.service";
import { ApiKeyController } from "./api-key.controller";
import { ApiKey } from "@entities/api-key.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ApiKey])],
    exports: [TypeOrmModule],
    providers: [ApiKeyService],
    controllers: [ApiKeyController],
})
export class ApiKeyModule { }
