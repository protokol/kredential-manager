import { IsNotEmpty, IsIn } from "class-validator";
import { VCSupportedTypes } from "../../types/VC";
import { EbsiSchemaTypeValidator } from "src/validators/ebsiSchema.validator";

export class CreateVcDto {
    @IsNotEmpty()
    @IsIn(VCSupportedTypes)
    readonly type: string;

    @EbsiSchemaTypeValidator({})
    readonly data: string;
}
