import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config();

const configService = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('KM_DB_HOST'),
  port: configService.get('KM_DB_PORT'),
  username: configService.get('KM_DB_USERNAME'),
  password: configService.get('KM_DB_PASSWORD'),
  database: configService.get('KM_DB_NAME'),
  schema: configService.get('KM_DB_SCHEMA'),
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: false,
  logging: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(dataSourceOptions);
export { dataSourceOptions, dataSource };