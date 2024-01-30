import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '1234',
    database: 'postgres',
    synchronize: false, // must be disabled in production
    entities: ['dist/**/*.entity.js'],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'custom_migration_table',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
