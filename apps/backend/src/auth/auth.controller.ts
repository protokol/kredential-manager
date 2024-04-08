import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import {
    Public,
} from 'nest-keycloak-connect';
import { IssuerService } from '../issuer/issuer.service';

@Controller('auth')
export class AuthController {
    constructor(private issuerService: IssuerService) { }
    @Get('.well-known/openid-configuration')
    @Public(true)
    getOpenIdConfiguration() {
        console.log('getOpenIdConfiguration');
        console.log(this.issuerService.getMetadata())
        return this.issuerService.getMetadata();
        // return {
        //     'issuer': 'https://ebsi.example.com',
        // }
    }
}