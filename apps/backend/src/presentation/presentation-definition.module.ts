import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PresentationDefinitionController } from "./presentation-definition.controller";
import { PresentationDefinitionService } from "./presentation-definition.service";
import { PresentationDefinition } from "@entities/presentation-definition.entity";

@Module({
    imports: [TypeOrmModule.forFeature([PresentationDefinition])],
    exports: [TypeOrmModule],
    providers: [PresentationDefinitionService],
    controllers: [PresentationDefinitionController],
})
export class PresentationDefinitionModule { }
