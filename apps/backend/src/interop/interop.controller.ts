import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    ValidationPipe,
    BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { InteropService } from "./interop.service";
import { Public } from "nest-keycloak-connect";
import { CreateCredentialsDto } from "./dto/create-credentials.dto";
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsObject,
    ValidateNested,
    IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class OfferConfigurationDto {
    @IsString()
    @IsNotEmpty()
    grantType: string;

    @IsString()
    @IsNotEmpty()
    scope: string;

    @IsNumber()
    @IsOptional()
    expiresIn?: number;
}

class CreateCredentialOfferDto {
    @IsNumber()
    @IsNotEmpty()
    schemaTemplateId: number;

    @IsObject()
    @IsNotEmpty()
    credentialData: Record<string, any>;

    @IsObject()
    @ValidateNested()
    @Type(() => OfferConfigurationDto)
    offerConfiguration: OfferConfigurationDto;
}

@Controller("interop")
@ApiTags("Interoperability Testing")
@Public()
export class InteropController {
    constructor(private interopService: InteropService) {}

    @Post("credentials")
    @ApiOperation({ summary: "Create test credentials for a holder" })
    @ApiResponse({
        status: 201,
        description: "Credentials created successfully",
    })
    @ApiResponse({ status: 400, description: "Invalid input" })
    async createTestCredentials(@Body() body: { holderDid: string }) {
        return this.interopService.createTestCredentials(body.holderDid);
    }

    @Get("status/:holderDid")
    @ApiOperation({ summary: "Get credential status for a holder" })
    async getCredentialStatus(@Param("holderDid") holderDid: string) {
        return this.interopService.getCredentialStatus(holderDid);
    }

    @Post("credential-offer")
    @ApiOperation({ summary: "Create a credential offer with QR code" })
    @ApiResponse({
        status: 201,
        description: "Credential offer created successfully",
    })
    @ApiResponse({ status: 400, description: "Invalid input" })
    async createCredentialOffer(
        @Body() createOfferDto: CreateCredentialOfferDto,
    ) {
        return this.interopService.createCredentialOffer(createOfferDto);
    }

    // @Post('webhook')
    // @ApiOperation({ summary: 'Webhook for credential claim status updates' })
    // async webhookUpdate(@Body() payload: any) {
    //     const { claimId, status } = payload;
    //     return this.interopService.updateClaimStatus(claimId, status);
    // }
}
