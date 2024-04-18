import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import {
    // AuthenticatedUser,
    Public,
    Roles,
    // RoleMatchingMode,
} from "nest-keycloak-connect";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }
}
