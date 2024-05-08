import { Student } from "../student/entities/student.entity";
import { VerifiableCredential } from "../vc/entities/VerifiableCredential";
import { DataSource, DataSourceOptions } from "typeorm";
import { Enrollment } from "../enrollment/entities/enrollment.entity";
import { Diploma } from "../diploma/entities/diploma.entity";
import { Course } from "../course/entities/course.entity";
import { Program } from "../program/entities/program.entity";
import { Did } from "../student/entities/did.entity";
import { Authorization } from "src/auth/entities/auth.entity";
import { Nonce } from "./../nonce/entities/nonce.entity";

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || "enterprise-wallet-user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "enterprise-wallet",
    synchronize: true, // must be disabled in production
    entities: [
        Student,
        VerifiableCredential,
        Enrollment,
        Diploma,
        Course,
        Program,
        Did,
        Authorization,
        Nonce
    ],
    migrations: ["dist/migrations/*{.js,.ts}"],
    migrationsTableName: "custom_migration_table",

};


const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
