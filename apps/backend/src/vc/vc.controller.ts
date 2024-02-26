import {
    Body,
    Controller,
    Query,
    Get,
    Post,
    Param,
    Patch,
    NotFoundException,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";
import { Public } from "nest-keycloak-connect";
import { CreateVcDto } from "./dto/create-vc.dto";
import { VerifiableEducationalID } from "src/types/schema/VerifiableEducationID202311";
import { EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema } from "src/types/schema/VerifiableDiploma202211";
import { VCRole, VCStatus } from "src/types/VC";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { VcService } from "./vc.service";
import { Student } from "src/student/entities/student.entity";
import {
    Pagination,
    PaginationParams,
} from "src/types/pagination/PaginationParams";
import { Sorting, SortingParams } from "src/types/pagination/SortingParams";
import { PaginatedResource } from "src/types/pagination/dto/PaginatedResource";
import {
    Filtering,
    FilteringParams,
} from "src/types/pagination/FilteringParams";

@Controller("verifiable-credentials")
export class VcController {
    constructor(
        private readonly vcService: VcService,
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
        const count = await this.vcService.count(whereCondition);
        return { count };
    }

    @Patch(":id/status")
    @Public(true) // TODO Integrate auth
    async updateStatus(
        @Param("id") id: string,
        @Body() updatePayload: UpdateStatusDto,
    ): Promise<any> {
        // TODO: Implement the SIGN process
        // TODO: Save signed data to vc_data_signed

        const updateResult = await this.vcService.update(id, updatePayload);
        if (updateResult.affected === 0) {
            throw new NotFoundException(
                `Credential with ID "${id}" not found.`,
            );
        }
        return { message: "Status updated successfully." };
    }

    @Get(":id")
    @Public(true)
    async getOne(@Param("id") id: number): Promise<any> {
        const item = await this.vcService.findOne(id);
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found.`);
        }
        return item;
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Public(true)
    async getAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["displayName"]) sort?: Sorting,
        @FilteringParams([]) filter?: Filtering,
    ): Promise<PaginatedResource<Partial<VerifiableCredential>>> {
        return await this.vcService.findAll(paginationParams, sort, filter);
    }

    @Post()
    @Public(true) // TODO Integrate auth
    async create(@Body() createVcDto: CreateVcDto) {
        console.log({ createVcDto });
        const newCredentialData = {
            did: -1,
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
                const did = await this.vcService.getOrCreateDid(
                    vc_data.credentialSubject.id,
                );
                console.log({ did });
                newCredentialData.did = did.id;
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

                const did = await this.vcService.getOrCreateDid(
                    vc_data.credentialSubject.id,
                );
                newCredentialData.did = did.id;
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
        this.vcService.save(newCredential);
    }
}
