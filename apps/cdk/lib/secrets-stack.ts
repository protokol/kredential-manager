import { generateClientId, generateRandomString, generateRealmName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface SecretsStackProps extends cdk.StackProps {
	stage: string;
}

export class SecretsStack extends cdk.Stack {
	public readonly databaseMasterSecret: Secret;
	public readonly keycloakAdminSecret: Secret;
	public readonly keycloakSecret: Secret;
	constructor(scope: Construct, id: string, props: SecretsStackProps) {
		super(scope, id, props);
		const { stage } = props;

		const realmName = generateRealmName(stage);
		const clientId = generateClientId(stage);
		const clientSecret = generateRandomString(32);

		this.databaseMasterSecret = new Secret(this, "DatabaseMasterSecret", {
			description: "Database master credentials",
			secretName: `${stage}/database/master`,
			generateSecretString: {
				secretStringTemplate: JSON.stringify({ USERNAME: "kredentialmanageradmin" }),
				generateStringKey: "PASSWORD",
				passwordLength: 32,
				excludePunctuation: true,
			},
		});

		this.keycloakAdminSecret = new Secret(this, "KeycloakAdminSecret", {
			secretName: `${stage}/keycloak/admin`,
			generateSecretString: {
				secretStringTemplate: JSON.stringify({ DB_USERNAME: "keycloackadmin" }),
				generateStringKey: "DB_PASSWORD",
				passwordLength: 32,
				excludePunctuation: true,
			},
		});

		this.keycloakSecret = new Secret(this, "KeycloakSecret", {
			secretName: `${props.stage}/keycloak/config`,
			secretObjectValue: {
				REALM: cdk.SecretValue.unsafePlainText(realmName),
				CLIENT_ID: cdk.SecretValue.unsafePlainText(clientId),
				CLIENT_SECRET: cdk.SecretValue.unsafePlainText(clientSecret),
			},
		});
	}
}
