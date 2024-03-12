import { IsNotEmpty } from "class-validator";

export class CreateSeedDto {
    @IsNotEmpty()
    readonly secret: string;
}
