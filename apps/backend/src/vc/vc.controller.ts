import {
    Body,
    Controller,
    Query,
    Get,
    Post,
    Param,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/entities/VerifiableCredential";
import { Repository } from "typeorm";
import { Public } from "nest-keycloak-connect";
import { CreateVcDto } from "./dto/create-vc.dto";
import { VerifiableEducationalID } from "src/types/schema/VerifiableEducationID202311";
import { EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema } from "src/types/schema/VerifiableDiploma202211";
import { VCRole, VCStatus } from "src/types/VC";
@Controller("verifiable-credentials")
export class VcController {
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        // eslint-disable-next-line prettier/prettier
    ) { }

    // Note: Count needs to be defined before :id route
    @Get("/count")
    @Public(true)
    async getCountByStatus(
        @Query("status") status?: VCStatus,
    ): Promise<{ count: number }> {
        const whereCondition: { status?: VCStatus } = {};
        if (status && Object.values(VCStatus).includes(status as VCStatus)) {
            whereCondition.status = status as VCStatus;
        }
        const count = await this.vcRepository.count({
            where: whereCondition,
        });

        return { count };
    }

    @Get(":id")
    @Public(true)
    async getOne(@Param("id") id: number): Promise<any> {
        const item = await this.vcRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found.`);
        }
        return item;
    }

    @Get()
    @Public(true)
    async getAll(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("status") status?: string,
        @Query("role") role?: string,
    ): Promise<any> {
        const pageNumber = Number(page);
        const whereCondition: { status?: VCStatus; role?: VCRole } = {};
        if (status && Object.values(VCStatus).includes(status as VCStatus)) {
            whereCondition.status = status as VCStatus;
        }
        if (status && Object.values(VCRole).includes(role as VCRole)) {
            whereCondition.role = role as VCRole;
        }
        const [result, total] = await this.vcRepository.findAndCount({
            where: whereCondition,
            take: limit,
            skip: (page - 1) * limit,
        });

        return {
            data: result,
            total,
            page: pageNumber,
            last_page: Math.ceil(total / limit),
        };
    }

    @Post()
    @Public(true) // TODO Integrate auth
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
