import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';



@Controller('')
@ApiTags('Proxy')
export class ProxyController {

    constructor(private readonly proxyService: ProxyService) { }

    @Get('params')
    @Public(true)
    @ApiOperation({ summary: 'Get query params' })
    async getQueryParams(
        @Query() req: any,
        @Res() res: Response
    ) {
        try {
            const queryParams = req;
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(queryParams);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Get('redirect')
    @Public(true)
    @ApiOperation({ summary: 'Get redirect location' })
    async getRedirect(@Query('url') url: string): Promise<string> {
        return this.proxyService.getRedirectLocation(url);
    }
}
