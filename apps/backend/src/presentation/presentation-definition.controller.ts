import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody } from '@nestjs/swagger';
import { PresentationDefinitionService } from './presentation-definition.service';
import { CreatePresentationDefinitionDto } from './dto/create-presentation-definition';
import { UpdatePresentationDefinitionDto } from './dto/update-presentation-definition';
import { handleError } from '../error/ebsi-error.util';
import { Public } from 'nest-keycloak-connect';

@ApiTags('Presentation Definitions')
@Controller('presentation-definitions')
export class PresentationDefinitionController {
    constructor(
        private readonly presentationDefinitionService: PresentationDefinitionService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new presentation definition' })
    @ApiResponse({ status: 201, description: 'Successfully created' })
    @ApiBody({
        description: 'The presentation definition to create',
        schema: {
            example: {
                "name": "Verify Diploma",
                "version": "1.0",
                "definition": {
                    "format": {
                        "jwt_vp": { "alg": ["ES256"] },
                        "jwt_vc": { "alg": ["ES256"] }
                    },
                    "input_descriptors": [
                        {
                            "id": "diploma_verification",
                            "format": { "jwt_vc": { "alg": ["ES256"] } },
                            "constraints": {
                                "fields": [{
                                    "path": ["$.vc.type"],
                                    "filter": {
                                        "type": "array",
                                        "contains": { "const": "DiplomaCredential" }
                                    }
                                }]
                            }
                        }
                    ]
                },
                "scope": "openid:test"
            }
        }
    })
    @HttpCode(201)
    async create(@Body() dto: CreatePresentationDefinitionDto) {
        try {
            return await this.presentationDefinitionService.create(dto);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all presentation definitions' })
    async findAll() {
        try {
            return await this.presentationDefinitionService.findAll();
        } catch (error) {
            throw handleError(error);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a presentation definition by ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.presentationDefinitionService.findOne(id);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a presentation definition' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePresentationDefinitionDto
    ) {
        try {
            return await this.presentationDefinitionService.update(id, dto);
        } catch (error) {
            throw handleError(error);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a presentation definition' })
    @HttpCode(200)
    async remove(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.presentationDefinitionService.remove(id);
            return { message: 'Presentation definition successfully deleted' };
        } catch (error) {
            throw handleError(error);
        }
    }

    @Get('definition/:scope')
    @ApiOperation({ summary: 'Get presentation definition by scope' })
    async getDefinition(@Param('scope') scope: string) {
        try {
            return await this.presentationDefinitionService.getByScope(scope);
        } catch (error) {
            throw handleError(error);
        }
    }
}