import { BackendDockerRepository } from "./constructs/BackendDockerRepository";
import { JsonRPCDockerRepository } from "./constructs/JsonRPCDockerRepository";
import { Logging } from "./constructs/Logging";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Cluster, FargateService, FargateTaskDefinition, Protocol } from "aws-cdk-lib/aws-ecs";
import {
	ApplicationLoadBalancer,
	ApplicationProtocol,
	ListenerCondition,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

interface BackendStackProps extends cdk.StackProps {
	cluster: Cluster;
	dbInstance: DatabaseInstance;
	backendSG: SecurityGroup;
	loadBalancer: ApplicationLoadBalancer;
	certificate: Certificate;
}
export class BackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: BackendStackProps) {
		super(scope, id, props);

		const backendDockerRepository = new BackendDockerRepository(this, "BackendDockerRepository");
		const rpcDockerRepositoriy = new JsonRPCDockerRepository(this, "RpcDockerRepository");
		const logging = new Logging(this, "Logging");

		// BACKEND
		const backendTaskDef = new FargateTaskDefinition(this, "BackendTaskDef");
		const backendContainer = backendTaskDef.addContainer("Container", {
			image: backendDockerRepository.image,
			logging: logging.enterpriseWalletLogDriver,
			environment: {
				DB_HOST: props.dbInstance.instanceEndpoint.hostname,
				// TODO: Adjust secrets
				REALM_SERVER: "https://keycloak.eu-dev.protokol.sh",
				REALM_NAME: "enterprise-wallet-realm",
				CLIENT_ID: "enterprise-wallet-app",
				REALM_PUBLIC_KEY:
					"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrsNhplvo6K5tEsDVDTgyMUibnmpXwEgWthyNaoAe0xKttXUQ2PlUL3I74FPsuVJ0emGIxNGnk0v7wbh61OdcSVidEB1LRw0c/IVeRKG7wY7ZTTInnuW+w8xXNiBEjPHlqNBVgkXB6WOXt1fQR/7Yc7lLcpq/5kdpFP84D5FydK+qymW65ahcbEomDkeLkvX6YpTcAJhlqLSTocysivPkiRtNXIqVysAWk9f6/5zqMvnngYojUbfb3oNglYCUklJ0A2S1D4Yfu43tpu2hNhNrcUK78EnSAdaiHJF4cDT0DvQDQHIut1/xcQGn2BD4OCFcsXIi9xf++aKevwIsg6ptQIDAQAB",
			},
			secrets: {
				DB_USERNAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "username"),
				DB_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "password"),
				DB_NAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "dbname"),
			},
		});

		const backendService = new FargateService(this, "Service", {
			serviceName: "BackendService",
			cluster: props.cluster,
			taskDefinition: backendTaskDef,
			desiredCount: 1,
			assignPublicIp: true,
			securityGroups: [props.backendSG],
		});

		backendContainer.addPortMappings({
			containerPort: 3000,
			hostPort: 3000,
			protocol: Protocol.TCP,
		});

		const backendListener = props.loadBalancer.addListener("ExternalPublicListener", {
			port: 443,
			open: true,
			protocol: ApplicationProtocol.HTTPS,
			certificates: [props.certificate],
		});

		backendListener.addTargets("BackendTarget", {
			port: 3000,
			protocol: ApplicationProtocol.HTTP,
			targets: [
				backendService.loadBalancerTarget({
					containerName: backendContainer.containerName,
					containerPort: 3000,
					protocol: Protocol.TCP,
				}),
			],
			healthCheck: {
				path: "/api",
				interval: Duration.minutes(1),
				healthyHttpCodes: "200",
			},
		});

		// RPC
		const rpcTaskDef = new FargateTaskDefinition(this, "RpcTaskDef", {
			memoryLimitMiB: 512,
			cpu: 256,
		});
		const rpcContainer = rpcTaskDef.addContainer("RPCContainer", {
			image: rpcDockerRepositoriy.image,
			logging: logging.rpcLogDriver,
		});

		const rpcService = new FargateService(this, "RpcService", {
			serviceName: "RpcService",
			cluster: props.cluster,
			taskDefinition: rpcTaskDef,
			desiredCount: 1,
			assignPublicIp: true,
			securityGroups: [props.backendSG],
		});
		rpcContainer.addPortMappings({
			containerPort: 8000,
			hostPort: 8000,
			protocol: Protocol.TCP,
		});

		backendListener.addTargets("RPCTarget", {
			port: 8000,
			protocol: ApplicationProtocol.HTTP,
			priority: 1,
			conditions: [ListenerCondition.pathPatterns(["/rpc"])],
			targets: [
				rpcService.loadBalancerTarget({
					containerName: rpcContainer.containerName,
					containerPort: 8000,
					protocol: Protocol.TCP,
				}),
			],
			healthCheck: {
				path: "/rpc",
				interval: Duration.minutes(1),
				healthyHttpCodes: "200-499",
			},
		});
	}
}
