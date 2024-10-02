import { EnvironmentConfig } from "../config";
import { Logging } from "./constructs/Logging";
import { PublicDockerRepositories } from "./constructs/PublicDockerRepositories";
import { generateName, getDomainNameWithPrefix } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Cluster, FargateService, FargateTaskDefinition, Protocol } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface KeycloakStackProps extends cdk.StackProps {
	cluster: Cluster;
	dbInstance: DatabaseInstance;
	keycloakSG: SecurityGroup;
	loadBalancer: ApplicationLoadBalancer;
	certificate: Certificate;
	config: EnvironmentConfig;
}

export class KeycloakStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: KeycloakStackProps) {
		super(scope, id, props);

		const { config } = props;
		const { stage } = config;

		const dockerRepositories = new PublicDockerRepositories(this, "DockerRepositories");
		const logging = new Logging(this, "Logging");

		const keycloakTaskDef = new FargateTaskDefinition(this, generateName(id, "KeycloakTaskDef"), {
			memoryLimitMiB: 1024,
			cpu: 512,
		});

		const keycloakAdminSecret = Secret.fromSecretNameV2(this, "KeycloakAdminSecret", `${stage}/keycloak/admin`);
		const keycloakConfigSecret = Secret.fromSecretNameV2(this, "KeycloakConfigSecret", `${stage}/keycloak/config`);
		const databaseMasterSecret = Secret.fromSecretNameV2(this, "DatabaseMasterSecret", `${stage}/database/master`);

		const container = keycloakTaskDef.addContainer(generateName(id, "Container"), {
			image: dockerRepositories.keycloackImage,
			logging: logging.enterpriseWalletLogDriver,
			command: ["start-dev"],
			environment: {
				KC_DB: "postgres",
				KC_DB_URL: `jdbc:postgresql://${props.dbInstance.instanceEndpoint.hostname}:5432/enterprisewallet`,
				KC_METRICS_ENABLED: "true",
				KC_LOG_LEVEL: "INFO",
				KC_HOSTNAME_STRICT: "false",
				KC_HTTP_ENABLED: "true",
				KC_PROXY: "edge",
				KC_HOSTNAME: getDomainNameWithPrefix("keycloak", config),
				KEYCLOAK_URL: "http://localhost:8080/auth",
			},
			secrets: {
				KC_DB_USERNAME: cdk.aws_ecs.Secret.fromSecretsManager(databaseMasterSecret, "DB_USERNAME"),
				KC_DB_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(databaseMasterSecret, "DB_PASSWORD"),
				KEYCLOAK_ADMIN: cdk.aws_ecs.Secret.fromSecretsManager(keycloakAdminSecret, "USERNAME"),
				KEYCLOAK_ADMIN_PASSWORD: cdk.aws_ecs.Secret.fromSecretsManager(keycloakAdminSecret, "PASSWORD"),
				REALM: cdk.aws_ecs.Secret.fromSecretsManager(keycloakConfigSecret, "REALM"),
				CLIENT_ID: cdk.aws_ecs.Secret.fromSecretsManager(keycloakConfigSecret, "CLIENT_ID"),
				CLIENT_SECRET: cdk.aws_ecs.Secret.fromSecretsManager(keycloakConfigSecret, "CLIENT_SECRET"),
			},
		});

		const service = new FargateService(this, generateName(id, "Service"), {
			serviceName: generateName(id, "KeycloakService"),
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

		const listener = props.loadBalancer.addListener(generateName(id, "ExternalPublicListener"), {
			port: 443,
			open: true,
			protocol: ApplicationProtocol.HTTPS,
			certificates: [props.certificate],
		});

		listener.addTargets(generateName(id, "KeycloakTarget"), {
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
