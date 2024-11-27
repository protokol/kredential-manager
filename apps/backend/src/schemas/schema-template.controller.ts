import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SchemaTemplateService } from './schema-template.service';
import { Public } from 'nest-keycloak-connect';
import { CreateSchemaDto } from './create-schema';

@ApiTags('Schema Templates')
@Controller('schema-templates')
export class SchemaTemplateController {
    constructor(private schemaTemplateService: SchemaTemplateService) { }

    @Post()
    @Public()
    @ApiOperation({ summary: 'Create a new schema template' })
    async create(@Body() createDto: CreateSchemaDto) {
        return await this.schemaTemplateService.create(createDto);
    }

    @Post(':id/validate')
    @Public()
    @ApiOperation({ summary: 'Validate data against schema template' })
    async validate(
        @Param('id') id: number,
        @Body() data: any
    ) {
        return await this.schemaTemplateService.validateData(id, data);
    }
}