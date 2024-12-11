import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class CreatePresentationDefinitionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    version: string;

    @IsObject()
    @IsNotEmpty()
    definition: {
        format: {
            jwt_vp: { alg: string[] };
            jwt_vc: { alg: string[] };
        };
        input_descriptors: Array<{
            id: string;
            format: { jwt_vc: { alg: string[] } };
            constraints: {
                fields: Array<{
                    path: string[];
                    filter: {
                        type: string;
                        contains: { const: string };
                    };
                }>;
            };
        }>;
    };

    @IsString()
    @IsNotEmpty()
    scope: string;
}
