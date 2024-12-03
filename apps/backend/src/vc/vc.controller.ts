import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    HttpCode,
    HttpStatus,
    HttpException,
    ParseIntPipe
} from "@nestjs/common";
import { VerifiableCredential } from "../entities/verifiableCredential.entity";
import { VCStatus } from "./../types/VC";
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
import { Resource } from "nest-keycloak-connect";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { createError } from "src/error/ebsi-error";

@Controller("verifiable-credentials")
@Resource("Verifiable-credentials")
@ApiTags('Verifiable Credentials')
export class VcController {
    constructor(
        private readonly vcService: VcService,
    ) { }

    // Note: Count needs to be defined before :id route
    @Get("/count")
    @HttpCode(HttpStatus.OK)
    async getCountByStatus(
        @FilteringParams(["status"]) filter?: Filtering,
    ): Promise<{ count: number }> {
        try {
            const count = await this.vcService.count(filter);
            return { count };
        } catch (error) {
            throw new HttpException(
                createError('INVALID_REQUEST', error.message),
                error.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    // @Public()
    @Patch(":id/status")
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param("id") id: number,
        @Body() updatePayload: UpdateStatusDto,
    ): Promise<any> {
        if (updatePayload.status == VCStatus.ISSUED) {
            try {
                await this.vcService.issueVerifiableCredential(id);
                return { message: 'Issued' };
            } catch (error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
        } else {
            const updateResult = await this.vcService.update(id, updatePayload);
            if (updateResult.affected === 0) {
                throw createError('INVALID_REQUEST', `Credential with ID "${id}" not found.`);
            }
        }
        return { message: "Status updated successfully." };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a verifiable credential by ID' })
    @ApiResponse({ status: 200, description: 'Credential found' })
    @ApiResponse({ status: 404, description: 'Credential not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            const credential = await this.vcService.findOne(id);
            if (!credential) {
                throw createError('INVALID_REQUEST', 'Credential not found')
            }
            return credential;
        } catch (error) {
            throw createError('INVALID_REQUEST', error.message)
        }
    }

    // @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["displayName", "created_at", "role", "status"])
        sort?: Sorting,
        @FilteringParams(["status"]) filter?: Filtering,
    ): Promise<PaginatedResource<Partial<VerifiableCredential>>> {
        try {
            return await this.vcService.findAll(paginationParams, sort, filter);
        } catch (error) {
            throw createError('INVALID_REQUEST', error.message)
        }
    }
}
