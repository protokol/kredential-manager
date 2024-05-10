import { IsOptional, IsString } from "class-validator";

export class CreateDidDto {

    @IsString()
    readonly identifier: string;

    @IsOptional()
    readonly studentId?: number;

    @IsOptional()
    readonly verifiableCredentialId?: number;
}
