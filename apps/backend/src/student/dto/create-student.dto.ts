import { IsString, IsEmail, IsDate, IsOptional } from "class-validator";

export class CreateStudentDto {
    @IsString()
    readonly first_name: string;

    @IsString()
    readonly last_name: string;

    @IsDate()
    readonly date_of_birth: Date;

    @IsString()
    readonly nationality: string;

    @IsDate()
    readonly enrollment_date: Date;

    @IsEmail()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly profile_picture?: string;
}
