import { IsEnum } from "class-validator";

import { GrantType } from "../credential-offer.type";

import { TrustFrameworkDto } from "../credential-offer.type";

import { IsOptional, ValidateNested } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { TrustFramework } from "../credential-offer.type";

export class OfferConfigurationDto {
    @ApiProperty({ enum: GrantType })
    @IsEnum(GrantType)
    grantType: GrantType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    expiresIn?: number;
}