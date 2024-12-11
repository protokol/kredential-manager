import { IsString, IsEmail, IsDate, IsOptional, IsNotEmpty } from "class-validator";

export class CreateAuthDto {
    @IsString()
    @IsNotEmpty()
    readonly client_id: string;

    @IsString()
    @IsNotEmpty()
    readonly response_type: string;

    @IsString()
    @IsNotEmpty()
    readonly scope: string;

    @IsString()
    @IsNotEmpty()
    readonly state: string;

    @IsString()
    @IsNotEmpty()
    readonly redirect_uri: string;

    @IsString()
    @IsNotEmpty()
    readonly nonce: string;

    @IsDate()
    @IsNotEmpty()
    readonly created_at: Date;

    @IsDate()
    @IsNotEmpty()
    readonly expires_at: Date;

    @IsString()
    @IsNotEmpty()
    readonly requested_credentials: string;
}
