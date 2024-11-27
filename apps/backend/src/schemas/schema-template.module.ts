import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaTemplateController } from './schema-template.controller';
import { SchemaTemplateService } from './schema-template.service';
import { CredentialSchema } from '@entities/credential-schema.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CredentialSchema])
    ],
    providers: [SchemaTemplateService],
    controllers: [SchemaTemplateController],
    exports: [SchemaTemplateService]
})
export class SchemaTemplateModule { }