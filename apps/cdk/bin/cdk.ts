import { Environment, config } from "../config";
import { BackendStack } from "../lib/backend-stack";
import { DatabaseStack } from "../lib/database-stack";
import { KeycloakStack } from "../lib/keycloak-stack";
import { SecretsStack } from "../lib/secrets-stack";
import { getStackName } from "../lib/utils";
import { VpcClusterStack } from "../lib/vpc-cluster-stack";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import "source-map-support/register";

dotenv.config();

const app = new cdk.App();
const stage = process.env.STAGE_NAME as Environment;
console.assert(stage, "`--context stage=` is required where `stage` is one of `miha`, or `prod`");
console.log(`Deploying stage: ${stage}`);
const envConfig = config[stage];
console.log(envConfig);

const STACK_NAMES = {
	SECRETS: "SecretsStack",
	VPC_CLUSTER: "VpcClusterStack",
	DATABASE: "DatabaseStack",
	KEYCLOAK: "KeycloakStack",
	BACKEND: "BackendStack",
};

function createStacks(app: cdk.App, stage: Environment) {
	// Secrets stack
	new SecretsStack(app, getStackName(STACK_NAMES.SECRETS), { stage: stage });

	// Vpc cluster stack
	const vpcClusterStack = new VpcClusterStack(app, getStackName(STACK_NAMES.VPC_CLUSTER), {
		config: envConfig,
	});

	// Database stack
	const databaseStack = new DatabaseStack(app, getStackName(STACK_NAMES.DATABASE), {
		vpc: vpcClusterStack.vpc,
		databaseSG: vpcClusterStack.databaseSG,
		config: envConfig,
	});

	// // Keycloak stack
	new KeycloakStack(app, getStackName(STACK_NAMES.KEYCLOAK), {
		cluster: vpcClusterStack.cluster,
		dbInstance: databaseStack.dbInstance,
		keycloakSG: vpcClusterStack.keycloakServiceSG,
		certificate: vpcClusterStack.keycloakCertificate,
		loadBalancer: vpcClusterStack.keycloakLoadBalancer,
		config: envConfig,
	});

	// // // Backend stack
	new BackendStack(app, getStackName(STACK_NAMES.BACKEND), {
		cluster: vpcClusterStack.cluster,
		dbInstance: databaseStack.dbInstance,
		backendSG: vpcClusterStack.backendServiceSG,
		certificate: vpcClusterStack.apiCertificate,
		loadBalancer: vpcClusterStack.backendLoadBalancer,
		config: envConfig,
	});
}

createStacks(app, stage);
