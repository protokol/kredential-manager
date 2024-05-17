import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./db/dataSource";
import { VcModule } from "./vc/vc.module";
import { VcController } from "./vc/vc.controller";
import { VcService } from "./vc/vc.service";
import { ConfigModule } from "@nestjs/config";
import { OpenIDProviderService } from "./openId/openId.service";
import {
    KeycloakConnectModule,
    ResourceGuard,
    RoleGuard,
    AuthGuard,
    PolicyEnforcementMode,
    TokenValidation,
} from "nest-keycloak-connect";
import { APP_GUARD } from "@nestjs/core";
import { StudentModule } from "./student/student.module";
import { StudentService } from "./student/student.service";
import { ProgramModule } from "./program/program.module";
import { EnrollmentModule } from "./enrollment/enrollment.module";
import { DiplomaModule } from "./diploma/diploma.module";
import { CourseModule } from "./course/course.module";
import { SeedModule } from "./seed/seed.module";
import { ResolverService } from "./resolver/resolver.service";
import { AuthController } from "./auth/auth.controller";
import { IssuerService } from "./issuer/issuer.service";
import { AuthService } from "./auth/auth.service";
import { NonceService } from "./nonce/nonce.service";
import { Nonce } from "./nonce/entities/nonce.entity";
import { DidService } from "./student/did.service";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(dataSourceOptions),
        TypeOrmModule.forFeature([Nonce]),

        // Keycloak
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
        VcModule,
        StudentModule,
        ProgramModule,
        CourseModule,
        DiplomaModule,
        EnrollmentModule,
        SeedModule
    ],
    controllers: [
        AppController,
        VcController,
        AuthController
    ],
    providers: [
        AppService,
        VcService,
        StudentService,
        DidService,
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
        // ResolverService,
        NonceService,
        OpenIDProviderService,
        IssuerService,
        AuthService,
    ],
    exports: [],
})
export class AppModule { }
