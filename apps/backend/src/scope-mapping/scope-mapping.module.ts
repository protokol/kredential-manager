import { PresentationDefinition } from "@entities/presentation-definition.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScopeCredentialMappingService } from "./scope-mapping.service";
import { ScopeCredentialMappingController } from "./scope-mapping.controller";
import { CredentialSchema } from "@entities/credential-schema.entity";
import { ScopeCredentialMapping } from "@entities/scope-credential-mapping.entity";


@Module({
    imports: [TypeOrmModule.forFeature([PresentationDefinition, CredentialSchema, ScopeCredentialMapping])],
    exports: [TypeOrmModule],
    providers: [ScopeCredentialMappingService],
    controllers: [ScopeCredentialMappingController],
})
export class ScopeMappingModule { }
