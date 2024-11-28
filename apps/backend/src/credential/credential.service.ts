import { Injectable } from '@nestjs/common';
import { SchemaTemplateService } from '../schemas/schema-template.service';
import { IssuerService } from '../issuer/issuer.service';

@Injectable()
export class CredentialService {
    constructor(
        private readonly schemaTemplateService: SchemaTemplateService,
        private readonly issuerService: IssuerService
    ) { }

    async createCredential(
        schemaId: number,
        credentialData: Record<string, any>,
        subjectDid: string
    ) {
        const issuerDid = process.env.ISSUER_DID;
        // Generate credential from template
        const credential = await this.schemaTemplateService.generateCredential(
            schemaId,
            credentialData,
            issuerDid,
            subjectDid
        );

        // Sign the credential
        const signedCredential = await this.issuerService.getJwtUtil().sign(credential, issuerDid, subjectDid);

        return {
            credential,
            signedCredential
        };
    }
}