import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SchemaTemplateService } from '../../schemas/schema-template.service';
import { VerificationService } from 'src/verification/verification.service';

@ValidatorConstraint({ name: 'isSchemaDataValid', async: true })
@Injectable()
export class IsSchemaDataValid implements ValidatorConstraintInterface {
    constructor(
        private readonly verificationService: VerificationService
    ) { }


    async validate(credentialData: Record<string, any>, args: ValidationArguments) {
        const { schemaTemplateId } = args.object as any;

        try {
            const validationResult = await this.verificationService.validateData(schemaTemplateId, credentialData);
            return validationResult.isValid;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'Credential data does not match schema validation rules';
    }
}