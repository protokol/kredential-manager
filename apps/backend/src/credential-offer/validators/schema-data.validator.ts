import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SchemaTemplateService } from '../../schemas/schema-template.service';

@ValidatorConstraint({ name: 'isSchemaDataValid', async: true })
@Injectable()
export class IsSchemaDataValid implements ValidatorConstraintInterface {
    constructor(private schemaTemplateService: SchemaTemplateService) { }


    async validate(credentialData: Record<string, any>, args: ValidationArguments) {
        const { schemaTemplateId } = args.object as any;

        console.log(schemaTemplateId)
        console.log(credentialData)

        try {
            const validationResult = await this.schemaTemplateService.validateData(schemaTemplateId, credentialData);
            return validationResult.isValid;
        } catch (error) {
            console.log("ERROR VALIDATING SCHEMA DATA")
            console.log(error)
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'Credential data does not match schema validation rules';
    }
}