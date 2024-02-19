import addFormats from "ajv-formats";
import Ajv2020 from "ajv/dist/2020.js";
import Ajv2019 from "ajv/dist/2019.js";
import AjvDraft07 from "ajv";
const ajv = new Ajv2020({ allErrors: true });
import $RefParser from "@apidevtools/json-schema-ref-parser";

import {
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
} from "class-validator";
import { VCSupportedSchemas, isVCSupportedType } from "src/types/VC";

export function EbsiSchemaTypeValidator(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "ValidateEbsiSchema",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const type = (args.object as any).type;
                    const data = (args.object as any).data;
                    let ajv;

                    if (!isVCSupportedType(type)) {
                        // TODO Enhance message
                        return false;
                    }

                    const bundledSchema = await $RefParser.bundle(
                        VCSupportedSchemas[type].schemaPath,
                    );

                    switch (bundledSchema.$schema) {
                        case "https://json-schema.org/draft/2020-12/schema": {
                            ajv = new Ajv2020({ allErrors: true });
                            break;
                        }
                        case "https://json-schema.org/draft/2019-09/schema": {
                            ajv = new Ajv2019({ allErrors: true });
                            break;
                        }
                        case "http://json-schema.org/draft-07/schema#": {
                            ajv = new AjvDraft07({ allErrors: true });
                            break;
                        }
                        default: {
                            throw new Error(
                                `Unknown version "${bundledSchema.$schema}"`,
                            );
                        }
                    }
                    // Add formats
                    addFormats(ajv);

                    const validate = ajv.compile(bundledSchema);
                    const valid = validate(data);
                    if (!valid) {
                        // Temporarily store the errors on the object being validated
                        (args.object as any).__tempValidationErrors =
                            validate.errors;
                    } else {
                        // Ensure to clean up if valid
                        delete (args.object as any).__tempValidationErrors;
                    }
                    return valid;
                },
                defaultMessage(args: ValidationArguments) {
                    console.log({ args });
                    const errors = (args.object as any).__tempValidationErrors;
                    console.log({ errors });
                    const errorMessage = ajv.errorsText(errors, {
                        separator: ", ",
                    });
                    // Clean up the temporary property
                    delete (args.object as any).__tempValidationErrors;
                    return `${args.property} is invalid: ${errorMessage}.`;
                },
            },
        });
    };
}
