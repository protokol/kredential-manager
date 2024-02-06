import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./db/dataSource";
import { VcModule } from "./vc/vc.module";
import { VcController } from "./vc/vc.controller";
import { VcService } from "./vc/vc.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(dataSourceOptions),
        VcModule,
    ],
    controllers: [AppController, VcController],
    providers: [AppService, VcService],
    exports: [],
})
export class AppModule {}
