import { AppConfig, AwsConfig, EnvironmentConfig, KredentialManagerConfig } from "./types";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const awsConfigSchema = z.object({
	REGION: z.string().min(1, "Region cannot be empty"),
	ACCOUNT: z.string().min(1, "Account cannot be empty"),
	PUBLIC_HOSTED_ZONE_ID: z.string().min(1, "Public Hosted Zone ID cannot be empty"),
	PUBLIC_HOSTED_ZONE_NAME: z.string().min(1, "Public Hosted Zone Name cannot be empty"),
});

const appConfigSchema = z.object({
	STAGE: z.string().min(1, "STAGE cannot be empty"),
	KM_DB_NAME: z.string().min(1, "KM_DB_NAME cannot be empty"),
	KM_DB_SCHEMA: z.string().min(1, "KM_DB_SCHEMA cannot be empty"),
	KM_DB_PORT: z
		.string()
		.transform(Number)
		.refine(port => port > 0, "KM_DB_PORT must be a positive number"),
	KC_VERSION: z.string().min(1, "KC_VERSION cannot be empty"),
	KC_PORT: z
		.string()
		.transform(Number)
		.refine(port => port > 0, "KC_PORT must be a positive number"),
	KC_REALM_NAME: z.string().min(1, "KC_REALM_NAME cannot be empty"),
	KC_LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
	KC_ADMIN_USERNAME: z.string().nullable(), // SECRET MANAGED BY SECRETS MANAGER
	KC_ADMIN_PASSWORD: z.string().nullable(), // SECRET MANAGED BY SECRETS MANAGER
	KC_REALM_SERVER: z.string().url("Invalid URL format for KC_REALM_SERVER"),
	KC_CLIENT_ID: z.string().min(1, "KC_CLIENT_ID cannot be empty"),
	KC_REALM_PUBLIC_KEY: z.string().min(1, "KC_REALM_PUBLIC_KEY cannot be empty"),
	KC_DB_NAME: z.string().min(1, "KC_DB_NAME cannot be empty"),
	KC_DB_PORT: z
		.string()
		.transform(Number)
		.refine(port => port > 0, "KC_DB_PORT must be a positive number"),
	KC_DB_SCHEMA: z.string().min(1, "KC_DB_SCHEMA cannot be empty"),
});

const enterpriseWalletConfigSchema = z.object({
	ISSUER_PRIVATE_KEY_ID: z.string().min(1, "ISSUER_PRIVATE_KEY_ID cannot be empty"),
	ISSUER_DID: z.string().min(1, "ISSUER_DID cannot be empty"),
	ISSUER_PRIVATE_KEY_JWK: z.string().min(1, "ISSUER_PRIVATE_KEY_JWK cannot be empty"),
	ISSUER_PUBLIC_KEY_JWK: z.string().min(1, "ISSUER_PUBLIC_KEY_JWK cannot be empty"),
});

const awsConfig = awsConfigSchema.parse({
	REGION: process.env.AWS_REGION,
	ACCOUNT: process.env.AWS_ACCOUNT,
	PUBLIC_HOSTED_ZONE_ID: process.env.AWS_PUBLIC_HOSTED_ZONE_ID,
	PUBLIC_HOSTED_ZONE_NAME: process.env.AWS_PUBLIC_HOSTED_ZONE_NAME,
}) as AwsConfig;

const appConfig = appConfigSchema.parse(process.env) as AppConfig;
const kredentialmanageradminConfig = enterpriseWalletConfigSchema.parse(process.env) as KredentialManagerConfig;

const config: EnvironmentConfig = {
	AWS_CONFIG: awsConfig,
	APP_CONFIG: appConfig,
	KM_CONFIG: kredentialmanageradminConfig,
};

export default config;
