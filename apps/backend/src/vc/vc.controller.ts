import { Body, Controller, Get, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/entities/VerifiableCredential";
import { Repository } from "typeorm";
import { Public } from "nest-keycloak-connect";
import { CreateVcDto } from "./dto/create-vc.dto";
import { VerifiableEducationalID } from "src/types/schema/VerifiableEducationID202311";
import { EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema } from "src/types/schema/VerifiableDiploma202211";
import { VCRole, VCStatus } from "src/types/VC";

@Controller("vc")
export class VcController {
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        // eslint-disable-next-line prettier/prettier
    ) { }

    @Get()
    @Public(true)
    async getAll(): Promise<any> {
        return this.vcRepository.find();
    }

    @Post()
    @Public(true)
    create(@Body() createVcDto: CreateVcDto) {
        console.log({ createVcDto });
        const newCredentialData = {
            did: "",
            displayName: "",
            mail: "",
            dateOfBirth: undefined,
            vc_data: {},
            vc_data_signed: {},
            type: createVcDto.type,
            role: VCRole.STUDENT,
            status: VCStatus.PENDING,
        };

        switch (createVcDto.type) {
            case "VerifiableEducationID202311": {
                const vc_data =
                    createVcDto.data as unknown as VerifiableEducationalID;

                newCredentialData.did = vc_data.credentialSubject.id;
                newCredentialData.displayName =
                    vc_data.credentialSubject.displayName ?? "";
                newCredentialData.mail = vc_data.credentialSubject.mail ?? "";
                const birthDate = vc_data.credentialSubject.dateOfBirth;
                newCredentialData.dateOfBirth = birthDate
                    ? new Date(birthDate)
                    : undefined;
                newCredentialData.vc_data = vc_data;

                break;
            }
            case "VerifiableDiploma202211": {
                const vc_data =
                    createVcDto.data as unknown as EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema;

                newCredentialData.did = vc_data.credentialSubject.id;
                newCredentialData.vc_data = vc_data;
                // Birthday, display name and mail are not present in this schema
                break;
            }
            default: {
                throw new Error(`Unknown type "${createVcDto.type}"`);
            }
        }

        const newCredential = new VerifiableCredential();
        Object.assign(newCredential, newCredentialData);
        this.vcRepository.save(newCredential);
    }
}
