import { DockerRepositories } from "./constructs/DockerRepositories";
import { Logging } from "./constructs/Logging";
import * as cdk from "aws-cdk-lib";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Cluster, FargateService, FargateTaskDefinition, Protocol } from "aws-cdk-lib/aws-ecs";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

interface BackendStackProps extends cdk.StackProps {
	cluster: Cluster;
	dbInstance: DatabaseInstance;
	backendSG: SecurityGroup;
}
export class BackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: BackendStackProps) {
		super(scope, id, props);

		const dockerRepositories = new DockerRepositories(this, "DockerRepositories");
		const logging = new Logging(this, "Logging");

		const backendTaskDef = new FargateTaskDefinition(this, "BackendTaskDef");
		const container = backendTaskDef.addContainer("Container", {
			image: dockerRepositories.backendImage,
			logging: logging.enterpriseWalletLogDriver,
			environment: {
				DB_HOST: props.dbInstance.instanceEndpoint.hostname,
				DB_USERNAME: props.dbInstance.secret!.secretValueFromJson("username").unsafeUnwrap(),
				DB_PASSWORD: props.dbInstance.secret!.secretValueFromJson("password").unsafeUnwrap(),
				DB_NAME: props.dbInstance.secret!.secretValueFromJson("dbname").unsafeUnwrap(),
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const service = new FargateService(this, "Service", {
			serviceName: "BackendService",
			cluster: props.cluster,
			taskDefinition: backendTaskDef,
			desiredCount: 1,
			assignPublicIp: true,
			securityGroups: [props.backendSG],
		});

		container.addPortMappings({
			containerPort: 3000,
			hostPort: 3000,
			protocol: Protocol.TCP,
		});
	}
}
