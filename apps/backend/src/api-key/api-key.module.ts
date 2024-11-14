import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "../entities/student.entity";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "../entities/did.entity";
import { ApiKeyService } from "./api-key.service";
import { ApiKeyController } from "./api-key.controller";
import { ApiKey } from "@entities/api-key.entity";
import { ApiKeyGuard } from "./api-key.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([ApiKey])
    ],
    providers: [ApiKeyService, ApiKeyGuard],
    controllers: [ApiKeyController],
    exports: [ApiKeyService, ApiKeyGuard, TypeOrmModule]
})
export class ApiKeyModule { }
