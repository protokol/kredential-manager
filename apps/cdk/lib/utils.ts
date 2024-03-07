export function getStackName(stack: string): string {
	return process.env.STAGE_NAME ? `${process.env.STAGE_NAME}${stack}` : stack;
}

export function getPublicHostedZoneId(): string {
	return process.env.PUBLIC_HOSTED_ZONE_ID || "Z08139353PYYZ63C4KDJW";
}

export function getPublicHostedZoneName(): string {
	return process.env.PUBLIC_HOSTED_ZONE_NAME || "eu-dev.protokol.sh";
}

export function getDomainNameWithPrefix(prefix: string): string {
	return process.env.STAGE_NAME
		? `${prefix}.${process.env.STAGE_NAME}.${getPublicHostedZoneId()}`
		: `${prefix}.${getPublicHostedZoneName()}`;
}
