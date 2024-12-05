import { ConflictException, Injectable } from "@nestjs/common";
import { IssuerService } from "src/issuer/issuer.service";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { VcService } from "src/vc/vc.service";
import { VpService } from "src/vp/vp.service";
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialSchema } from '../entities/credential-schema.entity';
import { Repository } from 'typeorm';

const MOCK_SUBJECT_DID = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbrCtgZWUtK1XegWb46qLCU8i1cyF8zN3FJAu76fJf1n6hXVsbEuDhRKfe7uE3r2tt4GLxFsX166Wq3fj1Su3yUHcnaYtQjDzVo3gmW71pe14bwNsosKrKWoQU8RkLVVS3DN';

@Injectable()
export class VerificationService {

    constructor(
        @InjectRepository(CredentialSchema)
        private schemaTemplateRepository: Repository<CredentialSchema>,
        private issuerService: IssuerService,
        private vpService: VpService,
        private vcService: VcService,
    ) {
    }

    async verifyCredential(schemaId: number, data: any) {
        const issuerDid = this.issuerService.getDid();
        const validationResult = await this.validateData(schemaId, data);

        const { credential, signedCredential } = await this.vcService.generateAndSignCredential(issuerDid, MOCK_SUBJECT_DID, schemaId, data);
        console.log({ credential })
        console.log({ signedCredential })

        const verifiedCredential = await this.vpService.verifyCredential(signedCredential, 'test-descriptor');

        console.log({ validationResult })
        return {
            validationResult,
            credential,
            signedCredential,
            verifiedCredential
        };
    }

    async validateData(schemaId: number, data: any): Promise<{ isValid: boolean; errors?: string[] }> {
        const schema = await this.schemaTemplateRepository.findOne({ where: { id: schemaId } });
        if (!schema) {
            throw new ConflictException('Schema template not found');
        }

        const errors: string[] = [];
        console.log("VALIDATION RULES", schema.validationRules)
        if (schema.validationRules) {
            for (const [field, rule] of Object.entries(schema.validationRules)) {
                if (rule.required && !data[field]) {
                    errors.push(`Missing required field: ${field}`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}