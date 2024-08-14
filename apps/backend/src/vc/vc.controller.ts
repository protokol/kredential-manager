import {
    Body,
    Controller,
    Query,
    Get,
    Post,
    Param,
    Patch,
    HttpCode,
    HttpStatus,
    BadRequestException,
    HttpException
} from "@nestjs/common";
import { VerifiableCredential } from "../entities/verifiableCredential.entity";
import { VerifiableEducationalID } from "./../types/schema/VerifiableEducationID202311";
import { EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema } from "src/types/schema/VerifiableDiploma202211";
import { VCRole, VCStatus } from "./../types/VC";
import { UpdateStatusDto } from "./dto/update-status";
import { VcService } from "./vc.service";
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
import { Public, Resource } from "nest-keycloak-connect";
// import { CreateVcDto } from "./dto/create-vc";
import { ApiTags } from "@nestjs/swagger";

@Controller("verifiable-credentials")
@Resource("Verifiable-credentials")
@ApiTags('Verifiable Credentials')
export class VcController {
    constructor(
        private readonly vcService: VcService,
        // eslint-disable-next-line prettier/prettier
    ) { }

    // Note: Count needs to be defined before :id route
    @Get("/count")
    @HttpCode(HttpStatus.OK)
    async getCountByStatus(
        @FilteringParams(["status"]) filter?: Filtering,
    ): Promise<{ count: number }> {
        const count = await this.vcService.count(filter);
        return { count };
    }

    @Public()
    @Patch(":id/status")
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param("id") id: number,
        @Body() updatePayload: UpdateStatusDto,
    ): Promise<any> {
        if (updatePayload.status == VCStatus.ISSUED) {
            try {
                const response = await this.vcService.issueVerifiableCredential(id);
                return { message: response };
            } catch (error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
        } else {
            const updateResult = await this.vcService.update(id, updatePayload);
            if (updateResult.affected === 0) {
                throw new BadRequestException(
                    `Credential with ID "${id}" not found.`,
                );
            }
        }
        return { message: "Status updated successfully." };
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    async getOne(@Param("id") id: number): Promise<any> {
        const item = await this.vcService.findOne(id);
        if (!item) {
            throw new BadRequestException(`Item with ID ${id} not found.`);
        }
        return item;
    }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["displayName", "created_at", "role", "status"])
        sort?: Sorting,
        @FilteringParams(["status"]) filter?: Filtering,
    ): Promise<PaginatedResource<Partial<VerifiableCredential>>> {
        return await this.vcService.findAll(paginationParams, sort, filter);
    }

    // @Post()
    // @HttpCode(HttpStatus.OK)
    // async create(@Body() createVcDto: CreateVcDto) {
    //     console.log({ createVcDto });
    //     const newCredentialData = {
    //         did: -1,
    //         displayName: "",
    //         mail: "",
    //         dateOfBirth: undefined,
    //         vc_data: {},
    //         vc_data_signed: {},
    //         type: createVcDto.type,
    //         role: VCRole.STUDENT,
    //         status: VCStatus.PENDING,
    //     };

    //     switch (createVcDto.type) {
    //         case "VerifiableEducationID202311": {
    //             const vc_data =
    //                 createVcDto.data as unknown as VerifiableEducationalID;
    //             const did = await this.vcService.getOrCreateDid(
    //                 vc_data.credentialSubject.id,
    //             );
    //             newCredentialData.did = did.id;
    //             newCredentialData.displayName =
    //                 vc_data.credentialSubject.displayName ?? "";
    //             newCredentialData.mail = vc_data.credentialSubject.mail ?? "";
    //             const birthDate = vc_data.credentialSubject.dateOfBirth;
    //             newCredentialData.dateOfBirth = birthDate
    //                 ? new Date(birthDate)
    //                 : undefined;
    //             newCredentialData.vc_data = vc_data;

    //             break;
    //         }
    //         case "VerifiableDiploma202211": {
    //             const vc_data =
    //                 createVcDto.data as unknown as EBSIVerifiableAccredidationEducationDiplomaCredentialSubjectSchema;

    //             const did = await this.vcService.getOrCreateDid(
    //                 vc_data.credentialSubject.id,
    //             );
    //             newCredentialData.did = did.id;
    //             newCredentialData.vc_data = vc_data;
    //             // Birthday, display name and mail are not present in this schema
    //             break;
    //         }
    //         default: {
    //             throw new BadRequestException(
    //                 `Unknown type "${createVcDto.type}"`,
    //             );
    //         }
    //     }

    //     const newCredential = new VerifiableCredential();
    //     Object.assign(newCredential, newCredentialData);
    //     this.vcService.create(newCredential);
    // }

}
