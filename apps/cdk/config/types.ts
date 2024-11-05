export type Environment = "prod" | "dev";

export interface AwsConfig {
	REGION: string;
	ACCOUNT: string;
	PUBLIC_HOSTED_ZONE_ID: string;
	PUBLIC_HOSTED_ZONE_NAME: string;
}

export interface AppConfig {
	STAGE: string;
	KC_VERSION: string;
	KC_PORT: number;
	KC_LOG_LEVEL: "DEBUG" | "INFO" | "WARN" | "ERROR";
	KC_ADMIN_USERNAME: string;
	KC_ADMIN_PASSWORD: string;
	KC_DB_NAME: string;
	KC_DB_PORT: number;
	KC_DB_SCHEMA: string;
	KC_REALM_NAME: string;
	KC_CLIENT_ID: string;
	KC_REALM_PUBLIC_KEY: string;
	KM_DB_NAME: string;
	KM_DB_PORT: number;
	KM_DB_SCHEMA: string;
}

export interface KredentialManagerConfig {
	ISSUER_PRIVATE_KEY_ID: string;
	ISSUER_DID: string;
	ISSUER_PRIVATE_KEY_JWK: string;
	ISSUER_PUBLIC_KEY_JWK: string;
}

export interface EnvironmentConfig {
	AWS_CONFIG: AwsConfig;
	APP_CONFIG: AppConfig;
	KM_CONFIG: KredentialManagerConfig;
}
