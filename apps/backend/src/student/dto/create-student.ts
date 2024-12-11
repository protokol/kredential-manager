import { IsString, IsEmail, IsDate, IsOptional } from "class-validator";

export class CreateStudentDto {
    @IsString()
    readonly first_name: string;

    @IsString()
    readonly last_name: string;

    @IsString()
    readonly date_of_birth: Date;

    @IsString()
    readonly nationality: string;

    @IsString()
    readonly enrollment_date: Date;

    @IsEmail()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly profile_picture?: string;

    constructor(
        first_name: string,
        last_name: string,
        date_of_birth: Date,
        nationality: string,
        enrollment_date: Date,
        email: string,
        profile_picture?: string
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.date_of_birth = date_of_birth;
        this.nationality = nationality;
        this.enrollment_date = enrollment_date;
        this.email = email;
        this.profile_picture = profile_picture;
    }
}
