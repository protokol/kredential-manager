import { IsNotEmpty, IsString } from "class-validator";

export class AttachDidDto {
    @IsString()
    @IsNotEmpty()
    readonly identifier: string;
}
