import { VerifiableCredential } from "../entities/VerifiableCredential";
import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "nestuser",
    password: "password",
    database: "backenddb",
    synchronize: false, // must be disabled in production
    entities: [VerifiableCredential],
    migrations: ["dist/src/migrations/*{.js,.ts}"],
    migrationsTableName: "custom_migration_table",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
