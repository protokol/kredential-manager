import { BackendDockerRepository } from "./constructs/BackendDockerRepository";
import { JsonRPCDockerRepository } from "./constructs/JsonRPCDockerRepository";
import { Logging } from "./constructs/Logging";
import { getDomainNameWithPrefix } from "./utils";
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
import { EnvironmentConfig } from "config/types";
import { Construct } from "constructs";

interface BackendStackProps extends cdk.StackProps {
	cluster: Cluster;
	dbInstance: DatabaseInstance;
	backendSG: SecurityGroup;
	certificate: Certificate;
	loadBalancer: ApplicationLoadBalancer;
	config: EnvironmentConfig;
}
export class BackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: BackendStackProps) {
		super(scope, id, props);
		const { config } = props;
		const { APP_CONFIG, KM_CONFIG } = config;

		const backendDockerRepository = new BackendDockerRepository(this, "BackendDockerRepository");
		const rpcDockerRepositoriy = new JsonRPCDockerRepository(this, "RpcDockerRepository");
		const logging = new Logging(this, "Logging");

		const backendTaskDef = new FargateTaskDefinition(this, "BackendTaskDef");
		const backendContainer = backendTaskDef.addContainer("Container", {
			image: backendDockerRepository.image,
			logging: logging.kredentialManagerLogDriver,
			environment: {
				KM_DB_HOST: props.dbInstance.instanceEndpoint.hostname,
				KM_DB_PORT: props.dbInstance.instanceEndpoint.port.toString(),
				KM_DB_SCHEMA: APP_CONFIG.KM_DB_SCHEMA,
				ISSUER_DID: KM_CONFIG.ISSUER_DID,
				ISSUER_PRIVATE_KEY_ID: KM_CONFIG.ISSUER_PRIVATE_KEY_ID,
				ISSUER_PRIVATE_KEY_JWK: KM_CONFIG.ISSUER_PRIVATE_KEY_JWK,
				ISSUER_PUBLIC_KEY_JWK: KM_CONFIG.ISSUER_PUBLIC_KEY_JWK,
				ISSUER_BASE_URL: getDomainNameWithPrefix("api", config, true),
				KC_REALM_SERVER: getDomainNameWithPrefix("keycloak", config, true),
				KC_REALM_NAME: APP_CONFIG.KC_REALM_NAME,
				KC_CLIENT_ID: APP_CONFIG.KC_CLIENT_ID,
				KC_REALM_PUBLIC_KEY: APP_CONFIG.KC_REALM_PUBLIC_KEY,
			},
			secrets: {
				KM_DB_USERNAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "username"),
				KM_DB_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "password"),
				KM_DB_NAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "dbname"),
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
