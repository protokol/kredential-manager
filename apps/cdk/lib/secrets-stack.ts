import * as cdk from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { EnvironmentConfig } from "config/types";
import { Construct } from "constructs";

interface SecretsStackProps extends cdk.StackProps {
	config: EnvironmentConfig;
}

export class SecretsStack extends cdk.Stack {
	public readonly databaseMasterSecret: Secret;
	public readonly keycloakSecret: Secret;
	public readonly realmKeysSecret: Secret;
	constructor(scope: Construct, id: string, props: SecretsStackProps) {
		super(scope, id, props);
		const { config } = props;
		const { APP_CONFIG } = config;
		const stage = APP_CONFIG.STAGE;

		this.databaseMasterSecret = new Secret(this, "DatabaseMasterSecret", {
			description: "Database master credentials",
			secretName: `${stage}/database/master`,
			generateSecretString: {
				secretStringTemplate: JSON.stringify({
					username: "kredentialmanageradmin",
					KM_DB_NAME: "kredentialmanager",
					KM_DB_PORT: 5432,
				}),
				generateStringKey: "password",
				passwordLength: 32,
				excludePunctuation: true,
			},
		});
	}
}
