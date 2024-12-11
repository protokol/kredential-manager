import { ApiProperty } from "@nestjs/swagger";
import { OfferConfigurationDto } from "./offerConfigurationDto";
import { IsNumber, IsObject, Validate, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateOfferDto {
    @ApiProperty()
    @IsNumber()
    schemaTemplateId: number;

    @ApiProperty()
    @IsObject()
    credentialData: Record<string, any>;

    @ApiProperty()
    @ValidateNested()
    @Type(() => OfferConfigurationDto)
    offerConfiguration: OfferConfigurationDto;
}   