import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./db/dataSource";
import { VcModule } from "./vc/vc.module";
import { VcController } from "./vc/vc.controller";
import { VcService } from "./vc/vc.service";
import { ConfigModule } from "@nestjs/config";
import {
    KeycloakConnectModule,
    ResourceGuard,
    RoleGuard,
    AuthGuard,
    PolicyEnforcementMode,
    TokenValidation,
} from "nest-keycloak-connect";
import { APP_GUARD } from "@nestjs/core";

@Module({
    imports: [
        KeycloakConnectModule.register({
            authServerUrl: process.env.REALM_SERVER || "",
            bearerOnly: true,
            realm: process.env.REALM_NAME || "",
            clientId: process.env.CLIENT_ID || "",
            secret: "",
            cookieKey: "KEYCLOAK_JWT",
            logLevels: ["verbose"],
            useNestLogger: false,
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            tokenValidation: TokenValidation.OFFLINE,
            realmPublicKey: process.env.REALM_PUBLIC_KEY || "",
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(dataSourceOptions),
        VcModule,
    ],
    controllers: [AppController, VcController],
    providers: [
        AppService,
        VcService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ResourceGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
    exports: [],
})
export class AppModule { }
