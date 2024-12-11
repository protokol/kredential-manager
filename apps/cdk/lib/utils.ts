import { AwsConfig, EnvironmentConfig } from "config/types";
import * as crypto from "crypto";

export function getStackName(stack: string, config: EnvironmentConfig): string {
	return config.APP_CONFIG.STAGE ? `${config.APP_CONFIG.STAGE}-${stack}` : stack;
}

export function getPublicHostedZoneId(env: AwsConfig): string {
	return env.PUBLIC_HOSTED_ZONE_ID;
}

export function getPublicHostedZoneName(env: AwsConfig): string {
	return env.PUBLIC_HOSTED_ZONE_NAME;
}

export function getDomainNameWithPrefix(
	prefix: string,
	config: EnvironmentConfig,
	includeHttps: boolean = false,
): string {
	const stage = config.APP_CONFIG.STAGE;
	const publicHostedZoneName = config.AWS_CONFIG.PUBLIC_HOSTED_ZONE_NAME;
	const domain = stage !== "dev" ? `${prefix}.${stage}.${publicHostedZoneName}` : `${prefix}.${publicHostedZoneName}`;
	return includeHttps ? `https://${domain}` : domain;
}

export function generateName(id: string, name: string): string {
	return `${id}-${name}`;
}

export function generateRandomString(length: number): string {
	return crypto.randomBytes(length).toString("hex");
}
