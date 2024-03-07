import { Logging } from "./constructs/Logging";
import { PublicDockerRepositories } from "./constructs/PublicDockerRepositories";
import { getDomainNameWithPrefix } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Cluster, FargateService, FargateTaskDefinition, Protocol } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

interface KeycloakStackProps extends cdk.StackProps {
	cluster: Cluster;
	dbInstance: DatabaseInstance;
	keycloakSG: SecurityGroup;
	loadBalancer: ApplicationLoadBalancer;
	certificate: Certificate;
}
export class KeycloakStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: KeycloakStackProps) {
		super(scope, id, props);

		const dockerRepositories = new PublicDockerRepositories(this, "DockerRepositories");
		const logging = new Logging(this, "Logging");

		const keycloakTaskDef = new FargateTaskDefinition(this, "KeycloakTaskDef", {
			memoryLimitMiB: 1024,
			cpu: 512,
		});

		const container = keycloakTaskDef.addContainer("Container", {
			image: dockerRepositories.keycloackImage,
			logging: logging.enterpriseWalletLogDriver,
			command: ["start-dev"],
			environment: {
				KC_DB: "postgres",
				KC_DB_URL: `jdbc:postgresql://${props.dbInstance.instanceEndpoint.hostname}:5432/enterprisewallet`,
				KC_METRICS_ENABLED: "true",
				KC_LOG_LEVEL: "INFO",
				// TODO: Move root admin to secret manager
				KEYCLOAK_ADMIN: "admin",
				KEYCLOAK_ADMIN_PASSWORD: "keycloak",
				// Investigate configs: https://www.keycloak.org/server/all-config
				KC_HOSTNAME_STRICT: "false",
				KC_HTTP_ENABLED: "true",
				KC_PROXY: "edge",
				KC_HOSTNAME: getDomainNameWithPrefix("keycloak"),
			},
			secrets: {
				KC_DB_USERNAME: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "username"),
				KC_DB_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(props.dbInstance.secret!, "password"),
			},
		});

		const service = new FargateService(this, "Service", {
			serviceName: "KeycloakService",
			cluster: props.cluster,
			taskDefinition: keycloakTaskDef,
			desiredCount: 1,
			assignPublicIp: true,
			securityGroups: [props.keycloakSG],
			healthCheckGracePeriod: Duration.minutes(6),
		});

		container.addPortMappings({
			containerPort: 8080,
			hostPort: 8080,
			protocol: Protocol.TCP,
		});

		const listener = props.loadBalancer.addListener("ExternalPublicListener", {
			port: 443,
			open: true,
			protocol: ApplicationProtocol.HTTPS,
			certificates: [props.certificate],
		});

		listener.addTargets("KeycloakTarget", {
			port: 8080,
			protocol: ApplicationProtocol.HTTP,
			targets: [
				service.loadBalancerTarget({
					containerName: container.containerName,
					containerPort: 8080,
					protocol: Protocol.TCP,
				}),
			],
			healthCheck: {
				path: "/",
				interval: Duration.minutes(3),
				healthyHttpCodes: "200-399",
			},
		});
	}
}
