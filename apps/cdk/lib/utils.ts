import { AwsEnvironment, EnvironmentConfig } from "../config";
import * as crypto from "crypto";

export function getStackName(stack: string): string {
	return process.env.STAGE_NAME ? `${process.env.STAGE_NAME}-${stack}` : stack;
}

export function getPublicHostedZoneId(env: AwsEnvironment): string {
	return env.publicHostedZoneId;
}

export function getPublicHostedZoneName(env: AwsEnvironment): string {
	return env.publicHostedZoneName;
}

export function getDomainNameWithPrefix(prefix: string, config: EnvironmentConfig): string {
	return config.stage !== "dev"
		? `${prefix}.${config.stage}.${config.aws.publicHostedZoneName}`
		: `${prefix}.${config.aws.publicHostedZoneName}`;
}

export function generateName(id: string, name: string): string {
	return `${id}-${name}`;
}

export function generateRandomString(length: number): string {
	return crypto.randomBytes(length).toString("hex");
}

export function generateRealmName(stage: string): string {
	return `${stage}-realm`;
}

export function generateClientId(stage: string): string {
	return `${stage}-client-id`;
}
