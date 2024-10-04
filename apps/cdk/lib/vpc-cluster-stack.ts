import { EnvironmentConfig } from "../config";
import { generateName, getDomainNameWithPrefix, getPublicHostedZoneId, getPublicHostedZoneName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

// Import the AwsEnvironment type

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
	public readonly backendServiceSG: SecurityGroup;
	public readonly keycloakServiceSG: SecurityGroup;

	constructor(scope: Construct, id: string, props: VpcClusterStackProps) {
		super(scope, id, props);

		const { config } = props;
		const { stage, aws } = config;
		console.log({ stage, aws });

		console.log(`VPCAccount: ${this.account}, Region: ${this.region}`);

		const publicZone = HostedZone.fromHostedZoneAttributes(this, generateName(id, "HostedZone"), {
			hostedZoneId: getPublicHostedZoneId(aws),
			zoneName: getPublicHostedZoneName(aws),
		});

		const apiDomainName = getDomainNameWithPrefix("api", config);
		console.log({ apiDomainName });
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
			],
			maxAzs: 2,
		});
		// this.cluster = new Cluster(this, generateName(id, "Cluster"), {
		// 	vpc: this.vpc,
		// 	clusterName: generateName(id, "Cluster"),
		// });

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
			description: `Security group for ${aws} keycloak service.`,
			securityGroupName: generateName(id, "keycloak-service-sg"),
			allowAllOutbound: true,
		});
		this.keycloakServiceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(8080));

		// new cdk.CfnOutput(this, "VpcId", {
		// 	value: this.vpc.vpcId,
		// 	exportName: `${id}-VpcId`,
		// });

		// this.vpc.publicSubnets.forEach((subnet, index) => {
		// 	new cdk.CfnOutput(this, `PublicSubnet${index + 1}Id`, {
		// 		value: subnet.subnetId,
		// 		exportName: `${id}-PublicSubnet${index + 1}Id`,
		// 	});
		// });
	}
}
