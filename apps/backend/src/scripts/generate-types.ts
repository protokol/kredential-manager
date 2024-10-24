import $RefParser from "@apidevtools/json-schema-ref-parser";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { compile } from "json-schema-to-typescript";
import { JSONSchema4 } from "json-schema";
import { VCSupportedSchemas } from "../types/VC";

async function generateTypes() {
    for (const key in VCSupportedSchemas) {
        if (VCSupportedSchemas.hasOwnProperty(key)) {
            const element = VCSupportedSchemas[key];
            const typePath = `src/types/schema/${key}.ts`;
            try {
                const schema = await $RefParser.dereference(element.schemaPath);
                const ts = await compile(
                    schema as JSONSchema4,
                    element.typeName,
                    {
                        bannerComment: "",
                    },
                );
                writeFileSync(resolve(typePath), ts);
            } catch (error) {
                console.error("Error generating types:", error);
            }
        }
    }
}
generateTypes();
