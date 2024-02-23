import { faker } from "@faker-js/faker";

function generateLearningOutcome() {
    return {
        name: `Outcome${faker.number.int()}`,
        id: `urn:epass:learningOutcome:${faker.number.int()}`,
        title: faker.company.buzzAdjective(),
        description: faker.lorem.sentence(),
        relatedSkill: [faker.internet.url()],
    };
}

function generateSpecifiedBy() {
    return {
        id: `urn:epass:qualification:${faker.number.int()}`,
        title: faker.company.catchPhrase(),
        eqfLevel: `http://data.europa.eu/snb/eqf/${faker.number.int({ min: 1, max: 8 })}`,
        learningOutcome: Array.from(
            { length: faker.number.int({ min: 1, max: 3 }) },
            generateLearningOutcome,
        ),
    };
}

function generateAchievement() {
    return {
        id: `urn:epass:learningAchievement:${faker.number.int()}`,
        title: faker.company.buzzPhrase(),
        definition: faker.lorem.sentence(),
        wasDerivedFrom: [
            {
                id: `urn:epass:assessment:${faker.number.int()}`,
                title: "Overall Diploma Assessment",
                grade: faker.helpers.arrayElement([
                    "excellent (5)",
                    "very good (4)",
                    "good (3)",
                ]),
                specifiedBy: generateSpecifiedBy(),
            },
        ],
        hasPart: {
            learningAchievements: Array.from(
                { length: faker.number.int({ min: 1, max: 3 }) },
                () => ({
                    id: `urn:epass:learningAchievement:${faker.number.int()}`,
                    title: faker.company.buzzVerb(),
                    specifiedBy: generateSpecifiedBy(),
                }),
            ),
        },
    };
}

export function generateVerifiableDiploma(did: string) {
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://base.uri.europass/contexts/v1",
        ],
        type: ["VerifiableCredential", "VerifiableAttestation", "Europass"],
        issuedDate: faker.date.past().toISOString(),
        id: did,
        issuer: `did:ebsi:${faker.number.hex(42)}`,
        issued: faker.date.past().toISOString(),
        issuanceDate: faker.date.past().toISOString(),
        validFrom: faker.date.past().toISOString(),
        credentialSubject: {
            id: `did:ebsi:${faker.number.hex(42)}`,
            identifier: [
                {
                    schemaID: "European Student Identifier",
                    value: faker.number.int.toString(),
                    id: `urn:schac:personalUniqueCode:int:esi:math.example.edu:${faker.number.int()}`,
                },
            ],
            achieved: [generateAchievement()],
        },
        credentialStatus: {
            id: "https://uri.to.status",
            type: "TrustedCredentialStatus2021",
        },
        credentialSchema: {
            id: "https://uri.to.schema",
            type: "FullJsonSchemaValidator2021",
        },
    };
}
