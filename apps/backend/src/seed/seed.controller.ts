import { Body, Controller, HttpException } from "@nestjs/common";
import { Post, HttpCode, HttpStatus } from "@nestjs/common";
import { Public } from "nest-keycloak-connect";
import { SeedService } from "./seed.service";
import { CreateSeedDto } from "./dto/create-seed";
import { ApiTags } from "@nestjs/swagger";
@Controller("seed")
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post("/init")
    @ApiTags('Development')
    @Public(true)
    @HttpCode(HttpStatus.OK)
    async seedDatabase(@Body() createSeedDto: CreateSeedDto) {
        createSeedDto.secret;
        if (createSeedDto.secret !== "secret") {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        return await this.seedService.seedAllTables();
    }
}
