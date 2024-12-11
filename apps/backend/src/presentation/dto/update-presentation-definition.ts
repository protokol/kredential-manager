import { IsString, IsObject, IsOptional } from 'class-validator';

export class UpdatePresentationDefinitionDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    version?: string;

    @IsObject()
    @IsOptional()
    definition?: {
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
}