import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VcModule } from "./vc/vc.module";
import { VcController } from "./vc/vc.controller";
import { VcService } from "./vc/vc.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { ResolverService } from "./resolver/resolver.service";
import { AuthController } from "./auth/auth.controller";
import { ProxyController } from "./proxy/proxy.controller";
import { IssuerService } from "./issuer/issuer.service";
import { AuthService } from "./auth/auth.service";
import { NonceService } from "./nonce/nonce.service";
import { DidService } from "./student/did.service";
import { AppConfig, DatabaseConfig } from "./config";
import { Nonce } from "@entities/nonce.entity";
import { LoggerMiddleware } from "./logger/LoggerMiddleware";
import { StateService } from "./state/state.service";
import { State } from "@entities/state.entity";
import { ProxyService } from "./proxy/proxy.service";
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, cache: true,
            load: [AppConfig, DatabaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Nonce, State]),

        // Keycloak
        KeycloakConnectModule.register({
            authServerUrl: process.env.KC_REALM_SERVER || "",
            bearerOnly: true,
            realm: process.env.KC_REALM_NAME || "",
            clientId: process.env.KC_CLIENT_ID || "",
            secret: "",
            cookieKey: "KEYCLOAK_JWT",
            logLevels: ["verbose"],
            useNestLogger: false,
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            tokenValidation: TokenValidation.OFFLINE,
            realmPublicKey: process.env.KC_REALM_PUBLIC_KEY || "",
        }),
        VcModule,
        StudentModule,
        ProgramModule,
        CourseModule,
        DiplomaModule,
        EnrollmentModule
    ],
    controllers: [
        AppController,
        VcController,
        AuthController,
        ProxyController
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
        ResolverService,
        NonceService,
        StateService,
        OpenIDProviderService,
        IssuerService,
        AuthService,
        ProxyService
    ],
    exports: [],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}