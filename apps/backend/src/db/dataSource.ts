import { VerifiableCredential } from "../entities/VerifiableCredential";
import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || "enterprise-wallet-user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "enterprise-wallet",
    synchronize: false, // must be disabled in production
    entities: [VerifiableCredential],
    migrations: ["dist/src/migrations/*{.js,.ts}"],
    migrationsTableName: "custom_migration_table",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
