#!/usr/bin/env node
import { BackendStack } from "../lib/backend-stack";
import { DatabaseStack } from "../lib/database-stack";
import { KeycloakStack } from "../lib/keycloak-stack";
import { getStackName } from "../lib/utils";
import { VpcClusterStack } from "../lib/vpc-cluster-stack";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import "source-map-support/register";

dotenv.config();

const app = new cdk.App();

const vpcClusterStack = new VpcClusterStack(app, getStackName("VpcClusterStack"), {
	hostedZoneId: "Z08139353PYYZ63C4KDJW",
	zoneName: "eu-dev.protokol.sh",
});
const databaseStack = new DatabaseStack(app, getStackName("DatabaseStack"), {
	vpc: vpcClusterStack.vpc,
	databaseSG: vpcClusterStack.databaseSG,
});
new KeycloakStack(app, getStackName("KeycloakStack"), {
	cluster: vpcClusterStack.cluster,
	dbInstance: databaseStack.dbInstance,
	keycloakSG: vpcClusterStack.keycloakServiceSG,
	certificate: vpcClusterStack.keycloakCertificate,
	loadBalancer: vpcClusterStack.keycloakLoadBalancer,
});
new BackendStack(app, getStackName("BackendStack"), {
	cluster: vpcClusterStack.cluster,
	dbInstance: databaseStack.dbInstance,
	backendSG: vpcClusterStack.backendServiceSG,
	certificate: vpcClusterStack.apiCertificate,
	loadBalancer: vpcClusterStack.backendLoadBalancer,
});
