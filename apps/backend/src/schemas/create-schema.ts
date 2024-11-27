import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidationRule {
    @ApiProperty()
    @IsString()
    // type: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    required?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    pattern?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    minLength?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    maxLength?: number;

    @ApiProperty({ required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    enum?: string[];
    // @ApiProperty()
    // @IsString()
    // type: string;

    // @ApiProperty({ required: false })
    // required?: boolean;

    // @ApiProperty({ required: false })
    // pattern?: string;

    // @ApiProperty({ required: false })
    // minLength?: number;

    // @ApiProperty({ required: false })
    // maxLength?: number;

    // @ApiProperty({ required: false })
    // enum?: string[];
}

export class CreateSchemaDto {
    @ApiProperty({
        example: "Schema01"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "1.0"
    })
    @IsString()
    version: string;

    @ApiProperty({
        example: {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            type: ["VerifiableCredential", "UniversityDegree"],
            credentialSubject: {
                id: "{{did}}",
                firstName: "{{firstName}}",
                lastName: "{{lastName}}",
                degree: "{{degree}}"
            }
        }
    })
    @IsObject()
    schema: Record<string, any>;

    @ApiProperty({
        example: {
            did: {
                type: "string",
                required: true,
                pattern: "^did:.*$"
            },
            firstName: {
                type: "string",
                required: true,
                minLength: 2
            },
            lastName: {
                type: "string",
                required: true,
                minLength: 2
            },
            degree: {
                type: "string",
                required: true,
                enum: ["Bachelor", "Master", "PhD"]
            }
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => ValidationRule)
    validationRules: Record<string, ValidationRule>;


    // @ApiProperty({
    //     example: ["UniversityDegreeCredential"]
    // })
    // @IsArray()
    // credentialTypes: string[];
}