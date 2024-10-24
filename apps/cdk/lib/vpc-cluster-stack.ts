import { generateName, getDomainNameWithPrefix, getPublicHostedZoneId, getPublicHostedZoneName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { EnvironmentConfig } from "config/types";
import { Construct } from "constructs";

interface VpcClusterStackProps extends cdk.StackProps {
	config: EnvironmentConfig;
}

export class VpcClusterStack extends cdk.Stack {
	public readonly vpc: Vpc;
	public readonly cluster: Cluster;

	// Load Balancers
	public readonly backendLoadBalancer: ApplicationLoadBalancer;
	public readonly keycloakLoadBalancer: ApplicationLoadBalancer;

	// Certificates
	public readonly apiCertificate: Certificate;
	public readonly keycloakCertificate: Certificate;

	// SGs
	public readonly databaseSG: SecurityGroup;
	public readonly lambdaSG: SecurityGroup;
	public readonly backendServiceSG: SecurityGroup;
	public readonly keycloakServiceSG: SecurityGroup;

	constructor(scope: Construct, id: string, props: VpcClusterStackProps) {
		super(scope, id, props);

		const { config } = props;
		const stage = config.APP_CONFIG.STAGE;

		const publicZone = HostedZone.fromHostedZoneAttributes(this, generateName(id, "HostedZone"), {
			hostedZoneId: getPublicHostedZoneId(config.AWS_CONFIG),
			zoneName: getPublicHostedZoneName(config.AWS_CONFIG),
		});

		const apiDomainName = getDomainNameWithPrefix("api", config);
		this.apiCertificate = new Certificate(this, generateName(id, "APICertificate"), {
			domainName: apiDomainName,
			validation: CertificateValidation.fromDns(publicZone),
		});

		const keycloakDomainName = getDomainNameWithPrefix("keycloak", config);
		this.keycloakCertificate = new Certificate(this, generateName(id, "KeycloakCertificate"), {
			domainName: keycloakDomainName,
			validation: CertificateValidation.fromDns(publicZone),
		});

		this.vpc = new Vpc(this, generateName(id, "VPC"), {
			subnetConfiguration: [
				{
					name: "public-subnet",
					subnetType: SubnetType.PUBLIC,
					cidrMask: 24,
				},

				{
					cidrMask: 24,
					name: "isolated-subnet",
					subnetType: SubnetType.PRIVATE_ISOLATED,
				},
				{
					cidrMask: 24,
					name: "private-subnet",
					subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
				},
			],
			maxAzs: 2,
			natGateways: 0,
			enableDnsHostnames: true,
			enableDnsSupport: true,
		});

		this.cluster = new Cluster(this, "Cluster", {
			vpc: this.vpc,
			clusterName: generateName(id, "Cluster"),
		});

		this.backendLoadBalancer = new ApplicationLoadBalancer(this, generateName(id, "BackendLoadBalancer"), {
			vpc: this.vpc,
			internetFacing: true,
		});
		this.keycloakLoadBalancer = new ApplicationLoadBalancer(this, generateName(id, "KeycloakLoadBalancer"), {
			vpc: this.vpc,
			internetFacing: true,
		});

		new ARecord(this, generateName(id, "BackendALBAlias"), {
			recordName: apiDomainName,
			zone: publicZone,
			comment: "Alias for Backend Load Balancer API",
			target: RecordTarget.fromAlias(new LoadBalancerTarget(this.backendLoadBalancer)),
		});

		new ARecord(this, generateName(id, "KeycloakALBAlias"), {
			recordName: keycloakDomainName,
			zone: publicZone,
			comment: "Alias for Keycloack Load Balancer",
			target: RecordTarget.fromAlias(new LoadBalancerTarget(this.keycloakLoadBalancer)),
		});

		// Database Stack SGs
		this.databaseSG = new SecurityGroup(this, generateName(id, "DatabaseSG"), {
			vpc: this.vpc,
			description: `Security group for ${stage} database. NOTE: Open port 5432 to the internet to access the DB.`,
			securityGroupName: generateName(id, "database-sg"),
			allowAllOutbound: false,
		});
		this.databaseSG.addIngressRule(Peer.ipv4(this.vpc.vpcCidrBlock), Port.tcp(5432));
		// Allow access to the database from the internet if not in prod
		if (stage !== "prod") {
			this.databaseSG.addIngressRule(Peer.anyIpv4(), Port.tcp(5432));
		}

		// Lambda Stack SGs
		this.lambdaSG = new SecurityGroup(this, generateName(id, "LambdaSG"), {
			vpc: this.vpc,
			description: `Security group for ${stage} lambda.`,
			securityGroupName: generateName(id, "lambda-sg"),
			allowAllOutbound: true,
		});

		this.vpc.addInterfaceEndpoint(generateName(id, "SecretsManagerEndpoint"), {
			service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
			subnets: {
				subnetType: SubnetType.PRIVATE_ISOLATED,
			},
			securityGroups: [this.lambdaSG],
		});

		// Backend Stack SGs
		this.backendServiceSG = new SecurityGroup(this, generateName(id, "BackendServiceSG"), {
			vpc: this.vpc,
			description: `Security group for ${stage} backend service.`,
			securityGroupName: generateName(id, "backend-service-sg"),
			allowAllOutbound: true,
		});
		this.backendServiceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(3000));
		// Allow access to the database from the backend service
		this.backendServiceSG.addIngressRule(this.databaseSG, Port.tcp(5432));

		// Keycloak Stack SGs
		this.keycloakServiceSG = new SecurityGroup(this, generateName(id, "KeycloakServiceSG"), {
			vpc: this.vpc,
			description: `Security group for ${stage} keycloak service.`,
			securityGroupName: generateName(id, "keycloak-service-sg"),
			allowAllOutbound: true,
		});
		this.keycloakServiceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(8080));
	}
}
