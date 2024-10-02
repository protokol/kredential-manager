// AWS environment
export type AwsEnvironment = {
	region: string;
	account: string;
	publicHostedZoneId: string;
	publicHostedZoneName: string;
};

// Environment config
export type EnvironmentConfig = {
	stage: Environment;
	aws: AwsEnvironment;
};

// Available environments
export const environments = ["miha", "dev", "prod"] as const;
export type Environment = (typeof environments)[number];
export type Config = Record<Environment, EnvironmentConfig>;

// Config
export const config: Config = {
	miha: {
		stage: "miha",
		aws: {
			region: "us-east-1",
			account: "654654561029",
			publicHostedZoneId: "Z08139353PYYZ63C4KDJW",
			publicHostedZoneName: "eu-dev.protokol.sh",
		},
	},
	dev: {
		stage: "dev",
		aws: {
			region: "us-east-1",
			account: "654654561029",
			publicHostedZoneId: "Z08139353PYYZ63C4KDJW",
			publicHostedZoneName: "eu-dev.protokol.sh",
		},
	},
	prod: {
		stage: "prod",
		aws: {
			region: "us-east-1",
			account: "654654561029",
			publicHostedZoneId: "Z08139353PYYZ63C4KDJW",
			publicHostedZoneName: "eu-dev.protokol.sh",
		},
	},
};
