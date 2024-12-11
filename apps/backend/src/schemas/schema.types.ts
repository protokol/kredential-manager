export interface SchemaProperty {
    type: string;
    format?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    enum?: string[];
    description?: string;
}

export interface JsonSchema {
    $schema: string;
    type: string;
    properties: {
        [key: string]: SchemaProperty;
    };
    required: string[];
    additionalProperties?: boolean;
}

export interface CreateSchemaDto {
    name: string;
    version: string;
    author: string;
    schema: JsonSchema;
    credentialTypes: string[];
    schemaUri: string;
}

export interface UpdateSchemaDto extends Partial<CreateSchemaDto> { }

export interface SchemaResponseDto extends CreateSchemaDto {
    id: number;
    created_at: Date;
    updated_at: Date;
}

export type SchemaTemplateData = {
    subjectDid: string;
    [key: string]: any;
};