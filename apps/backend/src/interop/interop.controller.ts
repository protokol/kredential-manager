import { Controller, Post, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InteropService } from './interop.service';
import { Public } from 'nest-keycloak-connect';
import { CreateCredentialsDto } from './dto/create-credentials.dto';

@Controller('interop')
@ApiTags('Interoperability Testing')
@Public()
export class InteropController {
    constructor(private interopService: InteropService) {}

    @Post('credentials')
    @ApiOperation({ summary: 'Create test credentials for a holder' })
    @ApiResponse({ status: 201, description: 'Credentials created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async createTestCredentials(@Body() body: { holderDid: string }) {
        console.log('createTestCredentials', body);
        return this.interopService.createTestCredentials(body.holderDid);
    }

    @Get('status/:holderDid')
    @ApiOperation({ summary: 'Get credential status for a holder' })
    async getCredentialStatus(@Param('holderDid') holderDid: string) {
        return this.interopService.getCredentialStatus(holderDid);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Webhook for credential claim status updates' })
    async webhookUpdate(@Body() payload: any) {
        const { claimId, status } = payload;
        return this.interopService.updateClaimStatus(claimId, status);
    }
} 