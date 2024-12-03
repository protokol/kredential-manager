import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemaTemplateService } from './schema-template.service';
import { CreateSchemaDto } from './create-schema';
import { Public } from 'nest-keycloak-connect';
import { PaginationParams } from 'src/types/pagination/PaginationParams';
import { FilteringParams } from 'src/types/pagination/FilteringParams';
import { Filtering } from 'src/types/pagination/FilteringParams';
import { SortingParams } from 'src/types/pagination/SortingParams';
import { Pagination } from 'src/types/pagination/PaginationParams';
import { Sorting } from 'src/types/pagination/SortingParams';

@Public(true) // TODO TMP
@ApiTags('Schema Templates')
@Controller('schema-templates')
export class SchemaTemplateController {
    constructor(private schemaTemplateService: SchemaTemplateService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new schema template' })
    @ApiResponse({ status: 201, description: 'Schema template created successfully' })
    async create(@Body() createDto: CreateSchemaDto) {
        return await this.schemaTemplateService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all schema templates' })
    @ApiResponse({ status: 200, description: 'List of all schema templates' })
    async findAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["name"]) sort?: Sorting,
        @FilteringParams(["name"]) filter?: Filtering
    ) {
        return await this.schemaTemplateService.findAll(paginationParams, sort, filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a schema template by ID' })
    @ApiResponse({ status: 200, description: 'Schema template found' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.schemaTemplateService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a schema template' })
    @ApiResponse({ status: 200, description: 'Schema template updated successfully' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: Partial<CreateSchemaDto>
    ) {
        return await this.schemaTemplateService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a schema template' })
    @ApiResponse({ status: 200, description: 'Schema template deleted successfully' })
    @ApiResponse({ status: 404, description: 'Schema template not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.schemaTemplateService.remove(id);
    }

    @Post(':id/validate')
    @ApiOperation({ summary: 'Validate data against schema template' })
    @ApiResponse({ status: 200, description: 'Data validation result' })
    async validate(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        return await this.schemaTemplateService.validateData(id, data);
    }
}