#!/usr/bin/env node
import { BackendStack } from "../lib/backend-stack";
import { DatabaseStack } from "../lib/database-stack";
import { KeycloakStack } from "../lib/keycloak-stack";
import { VpcClusterStack } from "../lib/vpc-cluster-stack";
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";

const app = new cdk.App();
// new CdkStack(app, "CdkStack", {
/* If you don't specify 'env', this stack will be environment-agnostic.
 * Account/Region-dependent features and context lookups will not work,
 * but a single synthesized template can be deployed anywhere. */
/* Uncomment the next line to specialize this stack for the AWS Account
 * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
/* Uncomment the next line if you know exactly what Account and Region you
 * want to deploy the stack to. */
// env: { account: '123456789012', region: 'us-east-1' },
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
const vpcClusterStack = new VpcClusterStack(app, "VpcClusterStack", {
	hostedZoneId: "Z08139353PYYZ63C4KDJW",
	zoneName: "eu-dev.protokol.sh",
});
const databaseStack = new DatabaseStack(app, "DatabaseStack", {
	vpc: vpcClusterStack.vpc,
	databaseSG: vpcClusterStack.databaseSG,
});
new KeycloakStack(app, "KeycloakStack", {
	cluster: vpcClusterStack.cluster,
	dbInstance: databaseStack.dbInstance,
	keycloakSG: vpcClusterStack.keycloakServiceSG,
	certificate: vpcClusterStack.keycloakCertificate,
	loadBalancer: vpcClusterStack.keycloakLoadBalancer,
});
new BackendStack(app, "BackendStack", {
	cluster: vpcClusterStack.cluster,
	dbInstance: databaseStack.dbInstance,
	backendSG: vpcClusterStack.backendServiceSG,
	certificate: vpcClusterStack.apiCertificate,
	loadBalancer: vpcClusterStack.backendLoadBalancer,
});
