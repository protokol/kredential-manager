/**
 * Schema for additional properties on credentialSubject to describe educational use cases - VAccreditation
 */
export type EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema =
    EBSIVerifiableAttestation & {
        /**
         * Additional properties on credentialSubject to describe educational use cases
         */
        credentialSubject?: {
            /**
             * An achievement of the person. Association LearningAchievement
             */
            achieved?: LearningAchievement[];
            /**
             * The entitlement of the person. Association Entitlement
             */
            entitledTo?: Entitlement[];
            /**
             * A learning activity that a person participated in or attended. Association LearningActivity
             */
            performed?: LearningActivity[];
            [k: string]: unknown;
        };
        [k: string]: unknown;
    };

/**
 * Schema of an EBSI Verifiable Attestation
 */
export interface EBSIVerifiableAttestation {
    /**
     * Defines semantic context of the Verifiable Attestation
     */
    "@context": string[];
    /**
     * Defines unique identifier of the Verifiable Attestation
     */
    id: string;
    /**
     * Defines the Verifiable Credential type
     */
    type: string[];
    /**
     * Defines the issuer of the Verifiable Attestation
     */
    issuer: string;
    /**
     * Defines the date and time, when the Verifiable Attestation becomes valid
     */
    issuanceDate: string;
    /**
     * Defines when the Verifiable Attestation was issued
     */
    issued: string;
    /**
     * Defines the date and time, when the Verifiable Attestation becomes valid
     */
    validFrom: string;
    /**
     * Defines the date and time, when the Verifiable Attestation expires
     */
    validUntil?: string;
    /**
     * Defines the date and time, when the Verifiable Attestation expires
     */
    expirationDate?: string;
    /**
     * Defines information about the subject that is described by the Verifiable Attestation
     */
    credentialSubject: {
        /**
         * Defines the DID of the subject that is described by the Verifiable Attestation
         */
        id?: string;
        [k: string]: unknown;
    };
    /**
     * Contains information about how to verify the status of the Verifiable Attestation (via the Revocation and Endorsement Registry, RER)
     */
    credentialStatus?: {
        /**
         * References record in the Revocation and Endorsement Registry (RER) to enable verification of a Verifiable Attestation’s validity
         */
        id: string;
        /**
         * Defines the Verifiable Credential status type
         */
        type: string;
        /**
         * Purpose of the status entry
         */
        statusPurpose?: "revocation" | "suspension";
        /**
         * Integer expressed as a string. The zero based index value identifies the bit position of the status
         */
        statusListIndex?: string;
        /**
         * URL referencing the StatusList2021Credential
         */
        statusListCredential?: string;
        [k: string]: unknown;
    };
    /**
     * Contains information about the credential schema (template) on which the Verifiable Authorisation is based
     */
    credentialSchema: {
        /**
         * References the credential schema (template) stored on the (relevant) Trusted Schemas Registry (TSR) on which the Verifiable Authorisation is based
         */
        id: string;
        /**
         * Defines credential schema type
         */
        type: "FullJsonSchemaValidator2021";
        [k: string]: unknown;
    };
    /**
     * Contains information about the process which resulted in the issuance of the Verifiable Attestation
     */
    evidence?: {
        /**
         * If present, it MUST contain a URL that points to where more information about this instance of evidence can be found.
         */
        id: string;
        /**
         * Defines the evidence type
         */
        type: string[];
        [k: string]: unknown;
    }[];
    /**
     * Contains information about the proof
     */
    proof?: {
        /**
         * Defines the proof type
         */
        type: string;
        /**
         * Defines the purpose of the proof
         */
        proofPurpose: string;
        /**
         * Defines the date and time, when the proof has been created
         */
        created: string;
        /**
         * Contains information about the verification method / proof mechanisms
         */
        verificationMethod: string;
        /**
         * Defines the proof value in JWS format
         */
        jws: string;
        [k: string]: unknown;
    };
    [k: string]: unknown;
}
/**
 * The acquisition of knowledge, skills or responsibility and autonomy. A recognised and/or awarded set of learning outcomes of an individual.
 */
export interface LearningAchievement {
    /**
     * Includes an additional free text note about the achievement.
     */
    additionalNote?: string[];
    /**
     * Defines The learning opportunity that was taken to obtain the awarded LearningSpecification. Association LearningOpportunity (URI)
     */
    associatedLearningOpportunity?: string;
    /**
     *  Includes a description of the achievement
     */
    definition?: string;
    /**
     * Define Entitlements the owner has received as a result of this achievement. Association Entitlement
     */
    entitlesTo?: Entitlement[];
    /**
     * Define smaller units of achievement, which when combined make up this achievement.
     */
    hasPart?: {
        /**
         * Define smaller units of achievement, which when combined make up this achievement. Association learningAchievement
         */
        learningAchievements: LearningAchievement[];
        [k: string]: unknown;
    };
    /**
     * Defines a portable and unique identifier of the learning achievement
     */
    id: string;
    /**
     * An alternative identifier assigned to the achievement by the organisation awarding the achievement. Association to Identifier
     */
    identifier?: Identifier1[];
    /**
     * Define What has been learned. Association LearningSpecification
     */
    specifiedBy?: LearningSpecification[];
    /**
     * The title of the achievement
     */
    title: string;
    /**
     * The awarding details of this achievement. Association AwardingProcess
     */
    wasAwardedBy?: {
        /**
         * An additional free text note (e.g. a comment, a remark, etc.)
         */
        additionalNote?: string[];
        /**
         * The DID of the awarding body that awarded the Achievement to the individual. Only in cases of co-awarding/co-graduation, where a qualification award is issued to an individual by two or more organisations the cardinality is greater than 1
         */
        awardingBody: string[];
        /**
         * The propertyName description
         */
        awardingDate?: string;
        /**
         * The location where the awarding activity took place (country/region where the qualification was awarded). Association Location (URI)
         */
        awardingLocation?: string[];
        /**
         * A description of the awarding process to the individual
         */
        definition?: string;
        /**
         * A portable and Unique Identifier of the Awarding Process
         */
        id: string;
        /**
         * An alternative identifier of the awarding process defined by the organization. Association to Identifier
         */
        identifier?: Identifier1[];
        /**
         * Defines the resulting learning achievement. Association to LearningAchievement
         */
        learningAchievement?: LearningAchievement[];
        /**
         * Defines the assessment that provided the basis for this awarding. Association to Assessment
         */
        used?: Assessment[];
        [k: string]: unknown;
    };
    /**
     * An assessment which proves the acquisition of the learning outcomes which make up the achievement. Association Assessment
     */
    wasDerivedFrom?: Assessment[];
    /**
     * Activities which contributed to the acquisition of the learning outcomes which make up the achievement. Association Learning Activity
     */
    wasInfluencedBy?: LearningActivity[];
    [k: string]: unknown;
}
/**
 * Defines a right, e.g. to practice a profession, take advantage of a learning opportunity or join an organisation, as a result of the acquisition of knowledge, skills, responsibility and/or autonomy
 */
export interface Entitlement {
    /**
     * An additional free text note about the entitlement
     */
    additionalNote?: string[];
    /**
     *  Includes a free text description of the specific rights the holder of the credential has acquired
     */
    definition?: string;
    /**
     * The date until which the entitlement was conferred
     */
    expiryDate?: string;
    /**
     * Defines the learning achievement (and related learning outcomes) which gave rise to this entitlement. Association Entitlement
     */
    hasPart?: Entitlement[];
    /**
     * Defines unique identifier of the Verifiable Accreditation
     */
    id: string;
    /**
     *  Defines an alternative identifier of the entitlement. Association to Identifier
     */
    identifier?: Identifier1[];
    /**
     * The date from which the entitlement was conferred
     */
    issuedDate?: string;
    /**
     * Defines a learning achievement which gave rise to the entitlement. Association EntitlementSpecification
     */
    specifiedBy?: {
        /**
         * An additional free text note about entitlement specification.
         */
        additionalNote?: string[];
        /**
         * Defines An alternative name of the entitlement specification
         */
        alternativeLabel?: string[];
        /**
         * A free text description of the entitlement specification
         */
        definition?: string[];
        /**
         * A credential-holder may be entitled to membership of an organisation or professional association; to access a learning opportunity; or to perform a specific employment
         */
        entitlementType: string;
        /**
         * Defines smaller entitlement specifications, which when combined make up this entitlement specification. Association EntitlementSpecification
         */
        hasPart?: EntitlementSpecification[];
        /**
         * The homepage (a public web document) of the entitlement specification.
         */
        homePage?: string[];
        /**
         * Defines A portable and unique identifier of the entitlement specification
         */
        id: string;
        /**
         * Defines an alternative identifier of the entitlement specification. Association to Identifier
         */
        identifier?: Identifier1[];
        /**
         * Defines the jurisdiction for which the entitlement is valid (the region or country).
         */
        limitJurisdiction?: string[];
        /**
         * Defines a An Occupation or Occupational Category. Association OccupationAssociation (URI)
         */
        limitNationalOccupation?: string[];
        /**
         * Defines a related Occupation: The An ESCO Occupation or Occupational class which the individual may access through the entitlement. Association EscoOccupationAssociation (URI)
         */
        limitOccupation?: string[];
        /**
         * Defines the DID of the organisation which acknowledges the entitlement (i.e. the organisation offering the learning opportunity, membership or employment opportunity).
         */
        limitOrganisation?: string[];
        /**
         * Defines the learning specification may influence the Entitlement specification. Association LearningSpecification
         */
        mayResultFrom?: {
            /**
             * An additional free text note about the learning specification.
             */
            additionalNote?: string[];
            /**
             * An alternative name of the learning specification
             */
            alternativeLabel?: string[];
            /**
             * The credit points assigned to the learning specification, following an alternative educational credit system.
             */
            creditPoints?: number;
            /**
             * Short and abstract description about the learning specification.
             */
            definition?: string;
            /**
             * The credit points assigned to the learning specification, following the ECTS credit system
             */
            eCTSCreditPoints?: number;
            /**
             * An associated level of education within a semantic framework describing education levels. Association EducationLevel (URI)
             */
            educationLevel?: string[];
            /**
             * An associated field of education from another semantic framework than the ISCED classification. Association EducationSubject  (URI)
             */
            educationSubject?: string[];
            /**
             * The maximum duration (in months) that a person may use to complete the learning opportunity.
             */
            entryRequirementsNote?: string;
            /**
             * The homepage (a public web document) of the learning specification.
             */
            homePage?: string;
            /**
             * Thematic Area according to the ISCED-F 2013 Classification.
             */
            iSCEDFCode?: string[];
            /**
             * Defines unique identifier of the Verifiable Accreditation
             */
            id: string;
            /**
             * Defines an alternative identifier of the learning specification, as assigned to it by the organisation who designed the specification.
             */
            identifier?: Identifier1[];
            /**
             * The instruction and/or assessment language(s) used
             */
            language?: string[];
            /**
             * The specification of a process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
             */
            learningActivitySpecification?: {
                /**
                 * Defines an additional free text description of the learning activity specification.
                 */
                additionalNote?: string[];
                /**
                 * Defines an alternative name of the activity specification
                 */
                alternativeLabel?: string[];
                /**
                 * Defines a free text description of the learning activity specification.
                 */
                definition?: string;
                /**
                 * A learning activity specification can be composed of smaller learning specifications, which when combined make up this learning specification. Association LearningActivitySpecification
                 */
                hasPart?: LearningActivitySpecification[];
                /**
                 * Includes the Webpage describing the activity specification.
                 */
                homePage?: string;
                /**
                 * Defines a portable and unique identifier of the learning activity specification
                 */
                id: string;
                /**
                 * Defines an alternative identifier of the learning outcome, used by the organization defining the learning actitivty. Association Identifier
                 */
                identifier?: Identifier1[];
                /**
                 * Defines the  instruction language(s) used
                 */
                language?: string[];
                /**
                 * Defines the type of learning activity
                 */
                learningActivityType?: string[];
                /**
                 * Defines the mode of learning and or assessment
                 */
                mode?: string[];
                /**
                 * An activity specification (e.g. a standard) of which this specification is a specialisation. Association LearningActivitySpecification
                 */
                specialisationOf?: LearningActivitySpecification[];
                /**
                 * Includes A public web document containing additional documentation about the learning activity specification.
                 */
                supplementaryDocument?: string[];
                /**
                 * Defines the expected learning outcomes this learning activity specification can lead or contribute to. Association to LearningSpecification
                 */
                teaches?: LearningSpecification[];
                /**
                 * Defines the title of the learning activity specification
                 */
                title?: string;
                /**
                 * The expected workload indicated in the estimated number of hours the learner is expected to spend engaged in the activity. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
                 */
                workload?: string;
                [k: string]: unknown;
            };
            /**
             * Describes the type of learning opportunity
             */
            learningOpportunityType?: string[];
            /**
             * An individual (expected) learning outcome of the learning specification. Association to LearningOutcome
             */
            learningOutcome?: LearningOutcome[];
            /**
             * The full learning outcome description of the learning specification
             */
            learningOutcomeDescription?: string;
            /**
             * The type of learning setting (formal, non-formal).
             */
            learningSetting?: string;
            /**
             * The maximum duration (in months) that a person may use to complete the learning opportunity.
             */
            maximumDuration?: string;
            /**
             * Defines the mode of learning and or assessment
             */
            mode?: string[];
            /**
             * A public web document containing additional documentation about the learning specification.
             */
            supplementaryDocument?: string[];
            /**
             * A specific target group or category for which this specification is designed.
             */
            targetGroup?: string[];
            /**
             * Defines the title of the learning specification
             */
            title?: string;
            /**
             * The estimated number of hours the learner is expected to spend engaged in learning to earn the award. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
             */
            volumeOfLearning?: string;
            /**
             * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
             */
            specialisationOf?: LearningSpecification[];
            /**
             * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
             */
            hasPart?: LearningSpecification[];
            /**
             * Rights (such as which the person may acquire as a result of acquiring the learning outcomes. Association   EntitlementSpecification
             */
            entitlementSpecification?: EntitlementSpecification[];
            /**
             * Assessments a person can undergo to prove the acquisition of the learning outcomes. Association   AssessmentSpecification
             */
            assessmentSpecification?: AssessmentSpecification[];
            /**
             * Refers to an activity related to the awarding of the learning specification, such as the country or region where the qualification is awarded, the awarding body and optionally the awarding period now or in the past. Association    AwardingOpportunity
             */
            awardingOpportunity?: AwardingOpportunity[];
            [k: string]: unknown;
        };
        /**
         * Defines An entitlement specification (e.g. a standard) of which this specification is a specialization. Association EntitlementSpecification
         */
        specializationOf?: EntitlementSpecification[];
        /**
         * A credential-holder may be entitled to membership of an organisation or professional association; to access a learning opportunity; or to perform a specific employment
         */
        status: string;
        /**
         * Defines a public web document containing additional documentation about the entitlement specification
         */
        supplementaryDocument?: string[];
        /**
         * The title of the entitlement specification
         */
        title?: string;
        [k: string]: unknown;
    };
    /**
     * Defines the title of the entitlement.
     */
    title: string;
    /**
     * Defines the learning achievement (and related learning outcomes) which gave rise to this entitlement. Association LearningAchievement
     */
    wasDerivedFrom?: LearningAchievement[];
    [k: string]: unknown;
}
/**
 * Defines an alternative Identifier object
 */
export interface Identifier1 {
    /**
     * Defines the schema used to define alternative identification
     */
    schemeID: string;
    /**
     * Define the alternative identification value
     */
    value: string;
    [k: string]: unknown;
}
/**
 * The propertyObject description
 */
export interface EntitlementSpecification {
    /**
     * An additional free text note about entitlement specification.
     */
    additionalNote?: string[];
    /**
     * Defines An alternative name of the entitlement specification
     */
    alternativeLabel?: string[];
    /**
     * A free text description of the entitlement specification
     */
    definition?: string[];
    /**
     * A credential-holder may be entitled to membership of an organisation or professional association; to access a learning opportunity; or to perform a specific employment
     */
    entitlementType: string;
    /**
     * Defines smaller entitlement specifications, which when combined make up this entitlement specification. Association EntitlementSpecification
     */
    hasPart?: EntitlementSpecification[];
    /**
     * The homepage (a public web document) of the entitlement specification.
     */
    homePage?: string[];
    /**
     * Defines A portable and unique identifier of the entitlement specification
     */
    id: string;
    /**
     * Defines an alternative identifier of the entitlement specification. Association to Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines the jurisdiction for which the entitlement is valid (the region or country).
     */
    limitJurisdiction?: string[];
    /**
     * Defines a An Occupation or Occupational Category. Association OccupationAssociation (URI)
     */
    limitNationalOccupation?: string[];
    /**
     * Defines a related Occupation: The An ESCO Occupation or Occupational class which the individual may access through the entitlement. Association EscoOccupationAssociation (URI)
     */
    limitOccupation?: string[];
    /**
     * Defines the DID of the organisation which acknowledges the entitlement (i.e. the organisation offering the learning opportunity, membership or employment opportunity).
     */
    limitOrganisation?: string[];
    /**
     * Defines the learning specification may influence the Entitlement specification. Association LearningSpecification
     */
    mayResultFrom?: {
        /**
         * An additional free text note about the learning specification.
         */
        additionalNote?: string[];
        /**
         * An alternative name of the learning specification
         */
        alternativeLabel?: string[];
        /**
         * The credit points assigned to the learning specification, following an alternative educational credit system.
         */
        creditPoints?: number;
        /**
         * Short and abstract description about the learning specification.
         */
        definition?: string;
        /**
         * The credit points assigned to the learning specification, following the ECTS credit system
         */
        eCTSCreditPoints?: number;
        /**
         * An associated level of education within a semantic framework describing education levels. Association EducationLevel (URI)
         */
        educationLevel?: string[];
        /**
         * An associated field of education from another semantic framework than the ISCED classification. Association EducationSubject  (URI)
         */
        educationSubject?: string[];
        /**
         * The maximum duration (in months) that a person may use to complete the learning opportunity.
         */
        entryRequirementsNote?: string;
        /**
         * The homepage (a public web document) of the learning specification.
         */
        homePage?: string;
        /**
         * Thematic Area according to the ISCED-F 2013 Classification.
         */
        iSCEDFCode?: string[];
        /**
         * Defines unique identifier of the Verifiable Accreditation
         */
        id: string;
        /**
         * Defines an alternative identifier of the learning specification, as assigned to it by the organisation who designed the specification.
         */
        identifier?: Identifier1[];
        /**
         * The instruction and/or assessment language(s) used
         */
        language?: string[];
        /**
         * The specification of a process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
         */
        learningActivitySpecification?: {
            /**
             * Defines an additional free text description of the learning activity specification.
             */
            additionalNote?: string[];
            /**
             * Defines an alternative name of the activity specification
             */
            alternativeLabel?: string[];
            /**
             * Defines a free text description of the learning activity specification.
             */
            definition?: string;
            /**
             * A learning activity specification can be composed of smaller learning specifications, which when combined make up this learning specification. Association LearningActivitySpecification
             */
            hasPart?: LearningActivitySpecification[];
            /**
             * Includes the Webpage describing the activity specification.
             */
            homePage?: string;
            /**
             * Defines a portable and unique identifier of the learning activity specification
             */
            id: string;
            /**
             * Defines an alternative identifier of the learning outcome, used by the organization defining the learning actitivty. Association Identifier
             */
            identifier?: Identifier1[];
            /**
             * Defines the  instruction language(s) used
             */
            language?: string[];
            /**
             * Defines the type of learning activity
             */
            learningActivityType?: string[];
            /**
             * Defines the mode of learning and or assessment
             */
            mode?: string[];
            /**
             * An activity specification (e.g. a standard) of which this specification is a specialisation. Association LearningActivitySpecification
             */
            specialisationOf?: LearningActivitySpecification[];
            /**
             * Includes A public web document containing additional documentation about the learning activity specification.
             */
            supplementaryDocument?: string[];
            /**
             * Defines the expected learning outcomes this learning activity specification can lead or contribute to. Association to LearningSpecification
             */
            teaches?: LearningSpecification[];
            /**
             * Defines the title of the learning activity specification
             */
            title?: string;
            /**
             * The expected workload indicated in the estimated number of hours the learner is expected to spend engaged in the activity. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
             */
            workload?: string;
            [k: string]: unknown;
        };
        /**
         * Describes the type of learning opportunity
         */
        learningOpportunityType?: string[];
        /**
         * An individual (expected) learning outcome of the learning specification. Association to LearningOutcome
         */
        learningOutcome?: LearningOutcome[];
        /**
         * The full learning outcome description of the learning specification
         */
        learningOutcomeDescription?: string;
        /**
         * The type of learning setting (formal, non-formal).
         */
        learningSetting?: string;
        /**
         * The maximum duration (in months) that a person may use to complete the learning opportunity.
         */
        maximumDuration?: string;
        /**
         * Defines the mode of learning and or assessment
         */
        mode?: string[];
        /**
         * A public web document containing additional documentation about the learning specification.
         */
        supplementaryDocument?: string[];
        /**
         * A specific target group or category for which this specification is designed.
         */
        targetGroup?: string[];
        /**
         * Defines the title of the learning specification
         */
        title?: string;
        /**
         * The estimated number of hours the learner is expected to spend engaged in learning to earn the award. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
         */
        volumeOfLearning?: string;
        /**
         * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
         */
        specialisationOf?: LearningSpecification[];
        /**
         * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
         */
        hasPart?: LearningSpecification[];
        /**
         * Rights (such as which the person may acquire as a result of acquiring the learning outcomes. Association   EntitlementSpecification
         */
        entitlementSpecification?: EntitlementSpecification[];
        /**
         * Assessments a person can undergo to prove the acquisition of the learning outcomes. Association   AssessmentSpecification
         */
        assessmentSpecification?: AssessmentSpecification[];
        /**
         * Refers to an activity related to the awarding of the learning specification, such as the country or region where the qualification is awarded, the awarding body and optionally the awarding period now or in the past. Association    AwardingOpportunity
         */
        awardingOpportunity?: AwardingOpportunity[];
        [k: string]: unknown;
    };
    /**
     * Defines An entitlement specification (e.g. a standard) of which this specification is a specialization. Association EntitlementSpecification
     */
    specializationOf?: EntitlementSpecification[];
    /**
     * A credential-holder may be entitled to membership of an organisation or professional association; to access a learning opportunity; or to perform a specific employment
     */
    status: string;
    /**
     * Defines a public web document containing additional documentation about the entitlement specification
     */
    supplementaryDocument?: string[];
    /**
     * The title of the entitlement specification
     */
    title?: string;
    [k: string]: unknown;
}
/**
 * The specification of a process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
 */
export interface LearningActivitySpecification {
    /**
     * Defines an additional free text description of the learning activity specification.
     */
    additionalNote?: string[];
    /**
     * Defines an alternative name of the activity specification
     */
    alternativeLabel?: string[];
    /**
     * Defines a free text description of the learning activity specification.
     */
    definition?: string;
    /**
     * A learning activity specification can be composed of smaller learning specifications, which when combined make up this learning specification. Association LearningActivitySpecification
     */
    hasPart?: LearningActivitySpecification[];
    /**
     * Includes the Webpage describing the activity specification.
     */
    homePage?: string;
    /**
     * Defines a portable and unique identifier of the learning activity specification
     */
    id: string;
    /**
     * Defines an alternative identifier of the learning outcome, used by the organization defining the learning actitivty. Association Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines the  instruction language(s) used
     */
    language?: string[];
    /**
     * Defines the type of learning activity
     */
    learningActivityType?: string[];
    /**
     * Defines the mode of learning and or assessment
     */
    mode?: string[];
    /**
     * An activity specification (e.g. a standard) of which this specification is a specialisation. Association LearningActivitySpecification
     */
    specialisationOf?: LearningActivitySpecification[];
    /**
     * Includes A public web document containing additional documentation about the learning activity specification.
     */
    supplementaryDocument?: string[];
    /**
     * Defines the expected learning outcomes this learning activity specification can lead or contribute to. Association to LearningSpecification
     */
    teaches?: LearningSpecification[];
    /**
     * Defines the title of the learning activity specification
     */
    title?: string;
    /**
     * The expected workload indicated in the estimated number of hours the learner is expected to spend engaged in the activity. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
     */
    workload?: string;
    [k: string]: unknown;
}
/**
 * Defines an opportunity to realise a given set of learning outcomes via a learning activity and/or assessment
 */
export interface LearningSpecification {
    /**
     * An additional free text note about the learning specification.
     */
    additionalNote?: string[];
    /**
     * An alternative name of the learning specification
     */
    alternativeLabel?: string[];
    /**
     * The credit points assigned to the learning specification, following an alternative educational credit system.
     */
    creditPoints?: number;
    /**
     * Short and abstract description about the learning specification.
     */
    definition?: string;
    /**
     * The credit points assigned to the learning specification, following the ECTS credit system
     */
    eCTSCreditPoints?: number;
    /**
     * An associated level of education within a semantic framework describing education levels. Association EducationLevel (URI)
     */
    educationLevel?: string[];
    /**
     * An associated field of education from another semantic framework than the ISCED classification. Association EducationSubject  (URI)
     */
    educationSubject?: string[];
    /**
     * The maximum duration (in months) that a person may use to complete the learning opportunity.
     */
    entryRequirementsNote?: string;
    /**
     * The homepage (a public web document) of the learning specification.
     */
    homePage?: string;
    /**
     * Thematic Area according to the ISCED-F 2013 Classification.
     */
    iSCEDFCode?: string[];
    /**
     * Defines unique identifier of the Verifiable Accreditation
     */
    id: string;
    /**
     * Defines an alternative identifier of the learning specification, as assigned to it by the organisation who designed the specification.
     */
    identifier?: Identifier1[];
    /**
     * The instruction and/or assessment language(s) used
     */
    language?: string[];
    /**
     * The specification of a process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
     */
    learningActivitySpecification?: {
        /**
         * Defines an additional free text description of the learning activity specification.
         */
        additionalNote?: string[];
        /**
         * Defines an alternative name of the activity specification
         */
        alternativeLabel?: string[];
        /**
         * Defines a free text description of the learning activity specification.
         */
        definition?: string;
        /**
         * A learning activity specification can be composed of smaller learning specifications, which when combined make up this learning specification. Association LearningActivitySpecification
         */
        hasPart?: LearningActivitySpecification[];
        /**
         * Includes the Webpage describing the activity specification.
         */
        homePage?: string;
        /**
         * Defines a portable and unique identifier of the learning activity specification
         */
        id: string;
        /**
         * Defines an alternative identifier of the learning outcome, used by the organization defining the learning actitivty. Association Identifier
         */
        identifier?: Identifier1[];
        /**
         * Defines the  instruction language(s) used
         */
        language?: string[];
        /**
         * Defines the type of learning activity
         */
        learningActivityType?: string[];
        /**
         * Defines the mode of learning and or assessment
         */
        mode?: string[];
        /**
         * An activity specification (e.g. a standard) of which this specification is a specialisation. Association LearningActivitySpecification
         */
        specialisationOf?: LearningActivitySpecification[];
        /**
         * Includes A public web document containing additional documentation about the learning activity specification.
         */
        supplementaryDocument?: string[];
        /**
         * Defines the expected learning outcomes this learning activity specification can lead or contribute to. Association to LearningSpecification
         */
        teaches?: LearningSpecification[];
        /**
         * Defines the title of the learning activity specification
         */
        title?: string;
        /**
         * The expected workload indicated in the estimated number of hours the learner is expected to spend engaged in the activity. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
         */
        workload?: string;
        [k: string]: unknown;
    };
    /**
     * Describes the type of learning opportunity
     */
    learningOpportunityType?: string[];
    /**
     * An individual (expected) learning outcome of the learning specification. Association to LearningOutcome
     */
    learningOutcome?: LearningOutcome[];
    /**
     * The full learning outcome description of the learning specification
     */
    learningOutcomeDescription?: string;
    /**
     * The type of learning setting (formal, non-formal).
     */
    learningSetting?: string;
    /**
     * The maximum duration (in months) that a person may use to complete the learning opportunity.
     */
    maximumDuration?: string;
    /**
     * Defines the mode of learning and or assessment
     */
    mode?: string[];
    /**
     * A public web document containing additional documentation about the learning specification.
     */
    supplementaryDocument?: string[];
    /**
     * A specific target group or category for which this specification is designed.
     */
    targetGroup?: string[];
    /**
     * Defines the title of the learning specification
     */
    title?: string;
    /**
     * The estimated number of hours the learner is expected to spend engaged in learning to earn the award. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
     */
    volumeOfLearning?: string;
    /**
     * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
     */
    specialisationOf?: LearningSpecification[];
    /**
     * A learning specification can be composed of other narrower learning specifications which when combined make up this learning specification. Association LearningSpecification
     */
    hasPart?: LearningSpecification[];
    /**
     * Rights (such as which the person may acquire as a result of acquiring the learning outcomes. Association   EntitlementSpecification
     */
    entitlementSpecification?: EntitlementSpecification[];
    /**
     * Assessments a person can undergo to prove the acquisition of the learning outcomes. Association   AssessmentSpecification
     */
    assessmentSpecification?: AssessmentSpecification[];
    /**
     * Refers to an activity related to the awarding of the learning specification, such as the country or region where the qualification is awarded, the awarding body and optionally the awarding period now or in the past. Association    AwardingOpportunity
     */
    awardingOpportunity?: AwardingOpportunity[];
    [k: string]: unknown;
}
/**
 * Defines a statement regarding what a learner knows, understands and is able to do on completion of a learning process, which are defined in terms of knowledge, skills and responsibility and autonomy.
 */
export interface LearningOutcome {
    /**
     * Defines a free text describing the learning outcome. A detailed learning outcome may include a description of what the student can do as a result of learning, with an indication of the level of achievement, and the conditions or context under which this can be performed (if applicable).
     */
    definition?: string;
    /**
     * Defines a portable and unique identifier of the learning outcome
     */
    id: string;
    /**
     * Defines an alternative identifier of the learning outcome, used by business logic. Association Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines the learning outcome type.
     */
    learningOutcomeType?: string;
    /**
     * Defines a legible, descriptive name for the learning outcome
     */
    name: string;
    /**
     * Includes a link to an ESCO Skill
     */
    relatedECOSkill?: string[];
    /**
     *  Includes a link to a related skill or the level of a related skill on a skill framework (except ESCO).
     */
    relatedSkill?: string[];
    /**
     * Defines the reusability level for the learning outcome
     */
    reusabilityLevel?: string;
    [k: string]: unknown;
}
/**
 * An Assessment Specification is a specification of a process establishing the extent to which a learner has attained particular knowledge, skills and competences against criteria such as learning outcomes or standards of competence.
 */
export interface AssessmentSpecification {
    /**
     * Defines an additional free text note about the assessment specification.
     */
    additionalNote?: string[];
    /**
     * Defines an alternative name of the assessment specification
     */
    alternativeLabel?: string[];
    /**
     * Defines the type of assessment
     */
    assessmentType?: string[];
    /**
     * Defines free text description of the assessment specification
     */
    definition?: string;
    /**
     * A description of the specification of which learning outcomes are or have been proven. Association to ScoringScheme/GradingScheme
     */
    gradingscheme?: {
        /**
         * Includes a free text describing the scoring scheme
         */
        definition?: string;
        /**
         * Defines a portable and unique identifier of the Grading Scheme
         */
        id: string;
        /**
         * Defines an alternative identifier of the Grading Scheme assigned to it by the organisation administering the scheme. Association to Identifier
         */
        identifier?: Identifier1[];
        /**
         * Includes public web document containing additional documentation about the scoring system
         */
        supplementaryDocument?: string[];
        /**
         * Defines the title of the scoring scheme.
         */
        title?: string;
        [k: string]: unknown;
    };
    /**
     * Defines Assessment Sub-Specifications.A assessment specification can be composed of other narrower assessment specifications which when combined make up this assessment specification. Association to AssessmentSpecification
     */
    hasPart?: AssessmentSpecification[];
    /**
     * Defines the homepage (a public web document) describing the details of the assessment specification
     */
    homePage?: string[];
    /**
     * Defines A portable and Unique Identifier of the Assessment Specification
     */
    id: string;
    /**
     * Defines an alternative identifier of the assessment specification, as assigned to it by the organisation who designed the specification. Association Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines the  language(s) of assessment used
     */
    language?: string[];
    /**
     * Defines mode of learning and or assessment
     */
    mode?: string[];
    /**
     * Demostrates The learning achievement (and related learning outcomes) this assessment is designed to test. Association to LearningSpecification
     */
    proves?: LearningSpecification[];
    /**
     * Defines An assessment specification (e.g. a standard) of which this specification is a specialisation. Association to AssessmentSpecification
     */
    specialisationOf?: AssessmentSpecification[];
    /**
     * Defines the urls for public web document containing additional documentation about the assessment specification
     */
    supplementaryDocument?: string[];
    /**
     * Defines the title of the assessment specification
     */
    title?: string;
    [k: string]: unknown;
}
/**
 * An awarding activity represents an activity related to the awarding of a LearningSpecification. It is used to specify the country or region where the LearningSpecification is awarded, the awarding body and optionally the awarding period now or in the past.
 */
export interface AwardingOpportunity {
    /**
     * The DID of the awarding body related to this awarding activity (i.e the organisation that issues the qualification) Only in cases of co-awarding/co-graduation, where a qualification is issued to an individual by two or more organisations the cardinality is greater than 1
     */
    awardingBody?: string[];
    /**
     * The date until when the awarding activities take/took place
     */
    endedAtTime?: string;
    /**
     * Defines unique identifier of the Verifiable Accreditation
     */
    id: string;
    /**
     * An alternative identifier of the awarding opportunity. Association to Identifier
     */
    identifier?: Identifier1[];
    /**
     * Location where the awarding activity takes place (country/region where the qualification is awarded).
     */
    location?: string;
    /**
     * The date since when the awarding activities take place. If not specified it is undefined (“not known”)
     */
    startedAtTime?: string;
    [k: string]: unknown;
}
/**
 * The result of a process establishing the extent to which a learner has attained particular knowledge, skills and competences against criteria such as learning outcomes or standards of competence.
 */
export interface Assessment {
    /**
     * Defines an additional free text note about the assessment
     */
    additionalNote?: string[];
    /**
     * Defines competent body that awarded the grade. Association Agent (URI)
     */
    assessedBy?: string[];
    /**
     * Includes the description of the assessment
     */
    definition?: string;
    /**
     * Defines a resulting grade of the assessment
     */
    grade: string;
    /**
     * Defines Sub-Assessments; Smaller assessments, which when combined make up and can influence this assessment. Association Assessment
     */
    hasPart?: Assessment[];
    /**
     * Defines a unique and portable identifier of the assessment.
     */
    id: string;
    /**
     * Defines the method of assessment supervision and id verification
     */
    idVerification?: string;
    /**
     * Defines an alternative identifier assigned to the assessment by the organisation grading the assessment. Association to Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines the Assessment Date: when the grade was awarded
     */
    issuedDate?: string;
    /**
     * Describes a histogram of results achieved by all the students of a particular learning assessment. Association to ResultDistribution
     */
    resultDistribution?: {
        /**
         * Describes a single range within the histogram. Association resultCategory
         */
        category?: ResultCategory[];
        /**
         *  Includes a free text description of the histogram
         */
        definition?: string;
        [k: string]: unknown;
    };
    /**
     * Defines Indicator of how well the student was graded when compared to other students. Association to ShortenedGrading
     */
    shortenedGrading?: {
        /**
         * DThe percentage of students of the same course who got exactly the same grade.
         */
        percentageEqual: number;
        /**
         * The percentage of students of the same course who got a higher grade.
         */
        percentageHigher: number;
        /**
         * The percentage of students of the same course who got a lower grade.
         */
        percentageLower: number;
        [k: string]: unknown;
    };
    /**
     * An Assessment Specification is a specification of a process establishing the extent to which a learner has attained particular knowledge, skills and competences against criteria such as learning outcomes or standards of competence.
     */
    specifiedBy?: {
        /**
         * Defines an additional free text note about the assessment specification.
         */
        additionalNote?: string[];
        /**
         * Defines an alternative name of the assessment specification
         */
        alternativeLabel?: string[];
        /**
         * Defines the type of assessment
         */
        assessmentType?: string[];
        /**
         * Defines free text description of the assessment specification
         */
        definition?: string;
        /**
         * A description of the specification of which learning outcomes are or have been proven. Association to ScoringScheme/GradingScheme
         */
        gradingscheme?: {
            /**
             * Includes a free text describing the scoring scheme
             */
            definition?: string;
            /**
             * Defines a portable and unique identifier of the Grading Scheme
             */
            id: string;
            /**
             * Defines an alternative identifier of the Grading Scheme assigned to it by the organisation administering the scheme. Association to Identifier
             */
            identifier?: Identifier1[];
            /**
             * Includes public web document containing additional documentation about the scoring system
             */
            supplementaryDocument?: string[];
            /**
             * Defines the title of the scoring scheme.
             */
            title?: string;
            [k: string]: unknown;
        };
        /**
         * Defines Assessment Sub-Specifications.A assessment specification can be composed of other narrower assessment specifications which when combined make up this assessment specification. Association to AssessmentSpecification
         */
        hasPart?: AssessmentSpecification[];
        /**
         * Defines the homepage (a public web document) describing the details of the assessment specification
         */
        homePage?: string[];
        /**
         * Defines A portable and Unique Identifier of the Assessment Specification
         */
        id: string;
        /**
         * Defines an alternative identifier of the assessment specification, as assigned to it by the organisation who designed the specification. Association Identifier
         */
        identifier?: Identifier1[];
        /**
         * Defines the  language(s) of assessment used
         */
        language?: string[];
        /**
         * Defines mode of learning and or assessment
         */
        mode?: string[];
        /**
         * Demostrates The learning achievement (and related learning outcomes) this assessment is designed to test. Association to LearningSpecification
         */
        proves?: LearningSpecification[];
        /**
         * Defines An assessment specification (e.g. a standard) of which this specification is a specialisation. Association to AssessmentSpecification
         */
        specialisationOf?: AssessmentSpecification[];
        /**
         * Defines the urls for public web document containing additional documentation about the assessment specification
         */
        supplementaryDocument?: string[];
        /**
         * Defines the title of the assessment specification
         */
        title?: string;
        [k: string]: unknown;
    };
    /**
     * Defines the title of the assessment.
     */
    title: string;
    [k: string]: unknown;
}
/**
 * Description of a single score or score range within a histogram of results
 */
export interface ResultCategory {
    /**
     *  Includes a count value
     */
    count: number;
    /**
     * Defines the label of the histogram score or score range. Should correspond to the grading scheme which have been used. E.g. 'C', or '20-30'
     */
    label: string;
    /**
     *  Includes the maximum score value
     */
    maxScore?: number;
    /**
     *  Includes the minimum score value
     */
    minScore?: number;
    /**
     * Includes the value for score
     */
    score?: number;
    [k: string]: unknown;
}
/**
 * Defines any process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
 */
export interface LearningActivity {
    /**
     * Defines more information using a additional free text note about the activity
     */
    additionalNote?: string[];
    /**
     * Defines a free text description of the learning activity
     */
    definition?: string;
    /**
     * Defines the DID of the organisation, or part of an organisation such as department, faculty, which directed the learning activity
     */
    directedBy?: string[];
    /**
     * Defines the  date the learner ended the activity
     */
    endedAtTime?: string;
    /**
     * Defines those smaller units of activity, which when combined make up this activity. Association LearningActivity
     */
    hasPart?: LearningActivity[];
    /**
     * Defines a portable and unique identifier of the learning activity
     */
    id: string;
    /**
     * Defines an alternative identifier of the learning activity assigned to the assessment by the organisation directing the activity. Association Identifier
     */
    identifier?: Identifier1[];
    /**
     * Defines how performing this activity contributed to the acquisition of these related learning achievements. Association to Achievement (URI)
     */
    influenced?: string[];
    /**
     * Defines the  location where the activity took place. Association to Location
     */
    location?: string[];
    /**
     * The specification of a process which leads to the acquisition of knowledge, skills or responsibility and autonomy.
     */
    specifiedBy?: {
        /**
         * Defines an additional free text description of the learning activity specification.
         */
        additionalNote?: string[];
        /**
         * Defines an alternative name of the activity specification
         */
        alternativeLabel?: string[];
        /**
         * Defines a free text description of the learning activity specification.
         */
        definition?: string;
        /**
         * A learning activity specification can be composed of smaller learning specifications, which when combined make up this learning specification. Association LearningActivitySpecification
         */
        hasPart?: LearningActivitySpecification[];
        /**
         * Includes the Webpage describing the activity specification.
         */
        homePage?: string;
        /**
         * Defines a portable and unique identifier of the learning activity specification
         */
        id: string;
        /**
         * Defines an alternative identifier of the learning outcome, used by the organization defining the learning actitivty. Association Identifier
         */
        identifier?: Identifier1[];
        /**
         * Defines the  instruction language(s) used
         */
        language?: string[];
        /**
         * Defines the type of learning activity
         */
        learningActivityType?: string[];
        /**
         * Defines the mode of learning and or assessment
         */
        mode?: string[];
        /**
         * An activity specification (e.g. a standard) of which this specification is a specialisation. Association LearningActivitySpecification
         */
        specialisationOf?: LearningActivitySpecification[];
        /**
         * Includes A public web document containing additional documentation about the learning activity specification.
         */
        supplementaryDocument?: string[];
        /**
         * Defines the expected learning outcomes this learning activity specification can lead or contribute to. Association to LearningSpecification
         */
        teaches?: LearningSpecification[];
        /**
         * Defines the title of the learning activity specification
         */
        title?: string;
        /**
         * The expected workload indicated in the estimated number of hours the learner is expected to spend engaged in the activity. This would include the notional number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study
         */
        workload?: string;
        [k: string]: unknown;
    };
    /**
     * Defines the date the learner started the activity
     */
    startedAtTime?: string;
    /**
     * Defines the title of the learning activity.
     */
    title?: string;
    /**
     * Defines when is used or taken opportunity to do this learning activity. Association to LearningOpportunity (URI)
     */
    usedLearningOpportunity?: string;
    /**
     * Defines the actual workload in number of hours the learner has spent engaged in the activity. This would include the number of hours in class, in group work, in practicals, as well as hours engaged in self-motivated study. Workload in Hours
     */
    workload?: string;
    [k: string]: unknown;
}
