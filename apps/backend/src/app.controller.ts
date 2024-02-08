import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import {
    AuthenticatedUser,
    Public,
    Roles,
    RoleMatchingMode,
} from "nest-keycloak-connect";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get("private")
    getPrivate() {
        return "Authenticated only!";
    }

    @Get("roles")
    @Roles({ roles: ["realm:admin"] })
    getRoles() {
        return "Admin role only!";
    }

    @Get("partial")
    @Public(false)
    getPartial(
        @AuthenticatedUser()
        user: any,
    ): string {
        if (user) {
            return `Hello ${user.preferred_username}`;
        } else {
            return "Hello world!";
        }
    }
}
