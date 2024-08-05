import { registerAs } from '@nestjs/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 35432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // entities: [`dist/**/*.entity{.ts,.js}`],
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: false, //process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: [`${__dirname}/db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
}));
