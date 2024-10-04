import { BackendDockerRepository } from "./constructs/BackendDockerRepository";
import { JsonRPCDockerRepository } from "./constructs/JsonRPCDockerRepository";
import { Logging } from "./constructs/Logging";
import { generateName, getDomainNameWithPrefix } from "./utils";
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
import { EnvironmentConfig } from "config";
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

		const backendDockerRepository = new BackendDockerRepository(this, "BackendDockerRepository");
		const rpcDockerRepositoriy = new JsonRPCDockerRepository(this, "RpcDockerRepository");
		const logging = new Logging(this, "Logging");

		// BACKEND
		const backendTaskDef = new FargateTaskDefinition(this, generateName(id, "BackendTaskDef"));
		const backendContainer = backendTaskDef.addContainer(generateName(id, "Container"), {
			image: backendDockerRepository.image,
			logging: logging.enterpriseWalletLogDriver,
			environment: {
				DB_HOST: props.dbInstance.instanceEndpoint.hostname,
				ISSUER_PRIVATE_KEY: "0xe79990c72548c68da2188b01e665ef4c411279260dcd2fc4107543b3220cf2cf",
				ISSUER_PRIVATE_KEY_ID:
					"did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU#z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU",
				ISSUER_BASE_URL: getDomainNameWithPrefix("api", config),
				KC_REALM_SERVER: getDomainNameWithPrefix("keycloak", config),
				KC_REALM_NAME: "enterprise-wallet-realm",
				KC_CLIENT_ID: "enterprise-wallet-app",
				KC_REALM_PUBLIC_KEY:
					"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3+FYwHel13e7MPg4UlzQyZjw9uxjDHQKpu4CjDAiyOdGxfC3T5FILJ9xiTrP5TbVkZTj/4fva/G5i81JQfPpPs18MrE95kVNV1YkC1sE8CwKuPBBk+ApDjv43Qtf1gOgtKRCF1pMmhcJkX1KeSmfan9KYjUk5QmC8j6bx8egQ2fuh7zyLN093Famr/4PQpGeTDiq471D9OOHj21RRKFDRIDu2JSnaJnOuyAA9C5Rq0rXMimkhMOOcFCctjadjPj1/oygUARZa86ZX8V4Wrsy9M5hK3V+OTSyaAlkj2lDQKD45Wo1BkxAz8SuyDfHnhiwupDmwdbm2QhhC/nP1dIsnQIDAQAB",
			},
			secrets: {
				DB_USERNAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "username"),
				DB_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "password"),
				DB_NAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "dbname"),
			},
		});

		const backendService = new FargateService(this, "Service", {
			serviceName: generateName(id, "BackendService"),
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
