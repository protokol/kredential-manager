import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EbsiError } from '../error/ebsi-error';
import { RequestUriService } from './requestUri.service';
import { Public } from 'nest-keycloak-connect';

@Public()
@ApiTags('Request')
@Controller('request')
export class RequestUriController {
    constructor(private readonly requestUriService: RequestUriService) { }

    @Post('request_uri')
    @ApiOperation({ summary: 'Create a verification request' })
    @ApiResponse({ status: 201, description: 'Verification request created successfully' })
    @ApiBody({
        description: 'The type of the credential to verify',
        schema: { example: { type: 'DiplomaCredential' } }
    })
    async createVerificationRequest(@Body('type') type: string) {
        try {
            return await this.requestUriService.createVerificationRequest(type);
        } catch (error) {
            throw new EbsiError('invalid_request', error.message);
        }
    }

    @Get('request_uri/:state')
    @ApiOperation({ summary: 'Get a verification request by state' })
    @ApiResponse({ status: 200, description: 'Verification request retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Verification request not found' })
    async getVerificationRequest(@Param('state') state: string) {
        try {
            return await this.requestUriService.getVerificationRequest(state);
        } catch (error) {
            throw new EbsiError('invalid_request', error.message);
        }
    }
}