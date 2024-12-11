export const RESERVED_TEMPLATE_VARIABLES = {
    UUID: '<uuid>',
    ISSUER_DID: '<issuerDid>',
    SUBJECT_DID: '<subjectDid>',
    TIMESTAMP: '<timestamp>',
} as const;

export type ReservedVariableValue = typeof RESERVED_TEMPLATE_VARIABLES[keyof typeof RESERVED_TEMPLATE_VARIABLES];

export function isReservedVariable(variable: string): boolean {
    return Object.values(RESERVED_TEMPLATE_VARIABLES).includes(variable as ReservedVariableValue);
}

export function getReservedVariableValues(): ReservedVariableValue[] {
    return Object.values(RESERVED_TEMPLATE_VARIABLES);
}