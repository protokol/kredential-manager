import $RefParser from "@apidevtools/json-schema-ref-parser";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { compile } from "json-schema-to-typescript";
import { JSONSchema4 } from "json-schema";

const schemasToGenerate = [
    {
        schemaPath:
            "src/schemas/education/verifiable-education-id/2023-11/schema.json",
        typeName: "VerifiableEducationID202311",
    },
];

async function generateTypes() {
    for (let index = 0; index < schemasToGenerate.length; index++) {
        const element = schemasToGenerate[index];
        const typePath = `src/types/${element.typeName}.ts`;
        console.log(`Generating types for ${element.typeName}`);
        try {
            const schema = await $RefParser.dereference(element.schemaPath);
            const ts = await compile(schema as JSONSchema4, element.typeName, {
                bannerComment: "",
            });
            writeFileSync(resolve(typePath), ts);
        } catch (error) {
            console.error("Error generating types:", error);
        }
    }
}

generateTypes();
