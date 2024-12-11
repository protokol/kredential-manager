import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemaTemplateService } from './schema-template.service';
import { CreateSchemaDto } from './create-schema';
import { PaginationParams } from 'src/types/pagination/PaginationParams';
import { FilteringParams } from 'src/types/pagination/FilteringParams';
import { Filtering } from 'src/types/pagination/FilteringParams';
import { SortingParams } from 'src/types/pagination/SortingParams';
import { Pagination } from 'src/types/pagination/PaginationParams';
import { Sorting } from 'src/types/pagination/SortingParams';
import { VerificationService } from 'src/verification/verification.service';
import { OpenIDProviderService } from 'src/openId/openId.service';

@ApiTags('Schema Templates')
@Controller('schema-templates')
export class SchemaTemplateController {
    constructor(
        private schemaTemplateService: SchemaTemplateService,
        private verificationService: VerificationService,
        private openIdService: OpenIDProviderService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new schema template' })
    @ApiResponse({ status: 201, description: 'Schema template created successfully' })
    async create(@Body() createDto: CreateSchemaDto) {
        try {
            const schema = await this.schemaTemplateService.create(createDto);
            await this.openIdService.refreshCredentialsSupported();
            return schema;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all schema templates' })
    @ApiResponse({ status: 200, description: 'List of all schema templates' })
    async findAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["name"]) sort?: Sorting,
        @FilteringParams(["name"]) filter?: Filtering
    ) {
        try {
            return await this.schemaTemplateService.findAll(paginationParams, sort, filter);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a schema template by ID' })
    @ApiResponse({ status: 200, description: 'Schema template found' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.schemaTemplateService.findOne(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a schema template' })
    @ApiResponse({ status: 200, description: 'Schema template updated successfully' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: Partial<CreateSchemaDto>
    ) {
        try {
            return await this.schemaTemplateService.update(id, updateDto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a schema template' })
    @ApiResponse({ status: 200, description: 'Schema template deleted successfully' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        try {
            const schema = await this.schemaTemplateService.remove(id)
            await this.openIdService.refreshCredentialsSupported();
            return schema;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post(':id/validate')
    @ApiOperation({ summary: 'Validate data against schema template' })
    @ApiResponse({ status: 200, description: 'Data validation result' })
    async validate(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        try {
            return await this.verificationService.validateData(id, data);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    @Post(':id/verify')
    @ApiOperation({ summary: 'Create a credential from a schema template and validate' })
    @ApiResponse({ status: 200, description: 'Data validation result' })
    async tester(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        try {
            return await this.verificationService.verifyCredential(id, data);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}