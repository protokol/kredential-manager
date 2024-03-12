import { IsEnum, IsNotEmpty } from "class-validator";
import { VCStatus } from "../../types/VC";

export class UpdateStatusDto {
    @IsEnum(VCStatus)
    @IsNotEmpty()
    status: VCStatus;
}
