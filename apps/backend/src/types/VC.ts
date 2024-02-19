export enum VCStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

export enum VCRole {
    STUDENT = "student",
}

export const VCSupportedSchemas = {
    VerifiableEducationID202311: {
        schemaPath:
            "src/schemas/education/verifiable-education-id/2023-11/schema.json",
    },
} as const;

export const VCSupportedTypes = Object.keys(
    VCSupportedSchemas,
) as (keyof typeof VCSupportedSchemas)[];

export type VCSupportedTypes = (typeof VCSupportedTypes)[number];

export function isVCSupportedType(type: string): type is VCSupportedTypes {
    return Object.keys(VCSupportedSchemas).includes(type);
}
