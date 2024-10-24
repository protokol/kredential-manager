import { registerAs } from '@nestjs/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.KM_DB_HOST || 'localhost',
  port: parseInt(process.env.KM_DB_PORT, 10) || 35432,
  username: process.env.KM_DB_USERNAME,
  password: process.env.KM_DB_PASSWORD,
  database: process.env.KM_DB_NAME,
  schema: process.env.KM_DB_SCHEMA,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: false,
  logging: false,
  migrations: [`${__dirname}/db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
}));
