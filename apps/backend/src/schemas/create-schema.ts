import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean, IsIn, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { Type } from 'class-transformer';


export function IsValidationRuleMap(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidationRuleMap',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'object' || value === null) {
                        return false;
                    }
                    // Iterate over each key-value pair in the object
                    for (const key in value) {
                        if (Object.prototype.hasOwnProperty.call(value, key)) {
                            const item = value[key];
                            if (typeof item !== 'object' || item === null) {
                                return false;
                            }
                            if (typeof item.type !== 'string' ||
                                (item.required !== undefined && typeof item.required !== 'boolean') ||
                                (item.pattern !== undefined && typeof item.pattern !== 'string') ||
                                (item.minLength !== undefined && typeof item.minLength !== 'number') ||
                                (item.maxLength !== undefined && typeof item.maxLength !== 'number') ||
                                (item.enum !== undefined && (!Array.isArray(item.enum) || !item.enum.every(e => typeof e === 'string')))) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a map of ValidationRule objects`;
                }
            }
        });
    };
}

export class ValidationRule {
    @ApiProperty()
    @IsString()
    type: string;

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
}

export class TrustFrameworkDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    uri: string;
}

export class DisplayDto {
    @ApiProperty({
        example: "Template Organization Name"
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "en"
    })
    @IsString()
    locale: string;
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
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "id": "<uuid>",
            "type": [
                "VerifiableCredential",
                "VerifiableAttestation",
                "AccessCredential"
            ],
            "issuer": {
                "id": "<issuerDid>"
            },
            "issuanceDate": "<timestamp>",
            "credentialSubject": {
                "id": "<subjectDid>",
                "firstName": "{{firstName}}",
                "lastName": "{{lastName}}"
            }
        }
    })
    @IsObject()
    schema: Record<string, any>;

    @ApiProperty({
        example: {
            firstName: {
                type: "string",
                required: true,
                minLength: 2
            },
            lastName: {
                type: "string",
                required: true,
                minLength: 2
            }
        }
    })

    // @IsObject()
    // @ValidateNested({ each: true })
    // @Type(() => ValidationRule)
    // validationRules: Record<string, ValidationRule>;

    @IsObject()
    @IsValidationRuleMap()
    validationRules: Record<string, ValidationRule>;

    @ApiProperty({
        example: {
            name: "Template Organization Name",
            type: "Template Organization Type",
            uri: "https://www.template-organization-uri.example"
        }
    })
    @ValidateNested()
    @Type(() => TrustFrameworkDto)
    trust_framework: {
        name: string;
        type: string;
        uri: string;
    };

    @ApiProperty({ type: [DisplayDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DisplayDto)
    display: {
        name: string;
        locale: string;
    }[];

    @ApiProperty({ example: "Template issuance criteria", required: false })
    @IsString()
    @IsOptional()
    issuance_criteria?: string;

    @ApiProperty({ example: ["Template Evidence Type 1", "Template Evidence Type 2"], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    supported_evidence_types?: string[];

    @ApiProperty({
        example: "jwt_vc",
        required: false,
        description: "Credential format. Must be 'jwt_vc' if provided."
    })

    @IsString()
    @IsOptional()
    @IsIn(['jwt_vc'], { message: "format must be 'jwt_vc'" })
    format?: string;
}
