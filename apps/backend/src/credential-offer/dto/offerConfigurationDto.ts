import { IsEnum, IsString } from "class-validator";

import { GrantType } from "../credential-offer.type";

import { IsOptional } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class OfferConfigurationDto {
    @ApiProperty({ enum: GrantType })
    @IsEnum(GrantType)
    grantType: GrantType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    scope?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    expiresIn?: number;
}