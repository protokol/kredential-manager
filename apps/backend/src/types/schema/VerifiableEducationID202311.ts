/**
 * Schema of a Verifiable Educational ID for a natural person participating in the educational use cases
 */
export type VerifiableEducationalID = EBSIVerifiableAttestation & {
    /**
     * Defines additional properties on credentialSubject to describe IDs that do not have a substantial level of assurance.
     */
    credentialSubject?: {
        /**
         * Defines a unique identifier of the credential subject. DID:Key value, generated by the user wallet and associated to the credential holder. Refer specification available at https://api-pilot.ebsi.eu/docs/specs/did-methods/did-method-for-natural-person
         */
        id: string;
        /**
         * Defines an alternative identifier for the credential subject and has as value the value of eduPersonPrincipalName attribute of the credential subject within the Home Organization (needs to be globally unique and persistent).
         */
        identifier: string;
        /**
         *  schacPersonalUniqueCode can have different forms urn:schac:personalUniqueCode:int:esi:<sHO>:<code> (where <sHO> is the Higher Education Institution's schacHomeOrganization) and urn:schac:personalUniqueCode:int:esi:<country-code>:<code> (<code> is a string that uniquely identifies the person).
         */
        schacPersonalUniqueCode?: string[];
        /**
         * value is different in different countries, mostly urn:schac:personalUniqueID:<country-code>:<code>.
         */
        schacPersonalUniqueID?: string;
        /**
         * Specifies the home organization of the credential subject
         */
        schacHomeOrganization?: string;
        /**
         * Defines current family name(s) of the credential subject which corresponds to the eduGAIN attribute sn
         */
        familyName?: string;
        /**
         * Defines current first name(s) of the credential subject which corresponds to the eduGAIN attribute givenName
         */
        firstName?: string;
        /**
         * The name(s) that should appear in white-pages-like applications
         */
        displayName?: string;
        /**
         * Defines date of birth of the credential subject (format: yyyyMMdd)
         */
        dateOfBirth?: string;
        /**
         * Defines the first and the family name(s) of the credential subject at the time of their birth
         */
        commonName?: string;
        /**
         * (primary) e-mail address of the credential subject as registered by the educational institution issuing the Verifiable Educational ID
         */
        mail?: string;
        /**
         * Unique, persistent identifier of the credential subject
         */
        eduPersonPrincipalName?: string;
        /**
         * Primary Affiliation within Home Organization
         */
        eduPersonPrimaryAffiliation?: string;
        /**
         * Affiliation within Home Organization. It can contain multiple values such as member, student, employee, faculty, staff, affiliate, alumni, etc.
         */
        eduPersonAffiliation?: string[];
        /**
         * The person's affiliations within Home Organization scoped with the Home Organization
         */
        eduPersonScopedAffiliation: string[];
        /**
         * represents identity assurance profiles (IAPs) https://wiki.refeds.org/display/ASS/REFEDS+Assurance+Framework+ver+1.0
         */
        eduPersonAssurance?: string[];
        [k: string]: unknown;
    };
    [k: string]: unknown;
};

/**
 * The schema defines a generic structure for any EBSI-related Verifiable Credentials according to the VCDM v2.0
 */
export interface EBSIVerifiableAttestation {
    /**
     * Semantic context for the issued credential. First element MUST be https://www.w3.org/ns/credentials/v2
     *
     * @minItems 1
     */
    "@context": [string, ...string[]];
    /**
     * Globally unique identifier for the issued credential. It can be a UUID or another globally unique identifier.
     */
    id: string;
    /**
     * Full type chain, used to identify the credential base types
     */
    type: string[];
    /**
     * DID of the credential issuer
     */
    issuer:
        | string
        | {
              /**
               * DID of the credential issuer
               */
              id: string;
              [k: string]: unknown;
          };
    /**
     * Defines the earliest point when the credential becomes valid.
     */
    validFrom: string;
    /**
     * Defines the latest point when the credential ceases to be valid.
     */
    validUntil?: string;
    credentialSubject:
        | {
              /**
               * Defines the DID of the subject that is described by the issued credential
               */
              id?: string;
              [k: string]: unknown;
          }
        | {
              /**
               * Defines the DID of the subject that is described by the issued credential
               */
              id?: string;
              [k: string]: unknown;
          }[];
    /**
     * Defines suspension and/or revocation details for the issued credential. Further redefined by the type extension
     */
    credentialStatus?: {
        /**
         * Exact identity for the credential status
         */
        id: string;
        /**
         * Defines the revocation type extension
         */
        type: string;
        [k: string]: unknown;
    };
    /**
     * One or more schemas that validate the Verifiable Credential.
     */
    credentialSchema:
        | {
              /**
               * References the credential schema stored on the Trusted Schemas Registry (TSR)
               */
              id: string;
              /**
               * Defines credential schema type
               */
              type: "JsonSchema" | "ShaclValidator2017";
              [k: string]: unknown;
          }
        | {
              /**
               * References the credential schema stored on the Trusted Schemas Registry (TSR)
               */
              id: string;
              /**
               * Defines credential schema type
               */
              type: "JsonSchema" | "ShaclValidator2017";
              [k: string]: unknown;
          }[];
    termsOfUse?:
        | {
              /**
               * Contains a URL that points to where more information about this instance of terms of use can be found.
               */
              id?: string;
              /**
               * Defines the type extension
               */
              type: string;
              [k: string]: unknown;
          }
        | {
              /**
               * Contains a URL that points to where more information about this instance of terms of use can be found.
               */
              id?: string;
              /**
               * Defines the type extension
               */
              type: string;
              [k: string]: unknown;
          }[];
    evidence?:
        | {
              /**
               * If present, it MUST contain a URL that points to where more information about this instance of evidence can be found.
               */
              id?: string;
              type: string | string[];
              [k: string]: unknown;
          }
        | {
              /**
               * If present, it MUST contain a URL that points to where more information about this instance of evidence can be found.
               */
              id?: string;
              type: string | string[];
              [k: string]: unknown;
          }[];
    relatedResource?: (
        | {
              /**
               * Digest value of Subresource Integrity
               */
              digestSRI: string;
              [k: string]: unknown;
          }
        | {
              /**
               * Digest value of multihash encoded in multibase.
               */
              digestMultibase: string;
              [k: string]: unknown;
          }
    )[];
    [k: string]: unknown;
}
