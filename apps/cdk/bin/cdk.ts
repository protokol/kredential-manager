import config from "../config";
import { BackendStack } from "../lib/backend-stack";
import { DatabaseStack } from "../lib/database-stack";
import { KeycloakStack } from "../lib/keycloak-stack";
import { SecretsStack } from "../lib/secrets-stack";
import { getStackName } from "../lib/utils";
import { VpcClusterStack } from "../lib/vpc-cluster-stack";
import * as cdk from "aws-cdk-lib";
import { Environment } from "config/types";
import * as dotenv from "dotenv";
import "source-map-support/register";

dotenv.config();

const app = new cdk.App();
const stage = config.APP_CONFIG.STAGE as Environment;
console.log(`Deploying stage: ${stage}`);
console.log(config.APP_CONFIG);
console.log(config.AWS_CONFIG);

function createStacks(app: cdk.App, stage: Environment) {
	// Secrets stack
	const secretsStack = new SecretsStack(app, getStackName("SecretsStack", config), { stage: stage });

	// Vpc cluster stack
	const vpcClusterStack = new VpcClusterStack(app, getStackName("VpcClusterStack", config), {
		config: config,
	});

	// Database stack
	const databaseStack = new DatabaseStack(app, getStackName("DatabaseStack", config), {
		vpc: vpcClusterStack.vpc,
		databaseSG: vpcClusterStack.databaseSG,
		lambdaSG: vpcClusterStack.lambdaSG,
		config: config,
		databaseMasterSecret: secretsStack.databaseMasterSecret,
	});

	// Keycloak stack
	new KeycloakStack(app, getStackName("KeycloakStack", config), {
		cluster: vpcClusterStack.cluster,
		dbInstance: databaseStack.dbInstance,
		keycloakSG: vpcClusterStack.keycloakServiceSG,
		certificate: vpcClusterStack.keycloakCertificate,
		loadBalancer: vpcClusterStack.keycloakLoadBalancer,
		config: config,
	});

	// Backend stack
	new BackendStack(app, getStackName("BackendStack", config), {
		cluster: vpcClusterStack.cluster,
		dbInstance: databaseStack.dbInstance,
		backendSG: vpcClusterStack.backendServiceSG,
		certificate: vpcClusterStack.apiCertificate,
		loadBalancer: vpcClusterStack.backendLoadBalancer,
		config: config,
	});
}

createStacks(app, stage);
