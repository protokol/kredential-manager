import { getDomainNameWithPrefix, getPublicHostedZoneId, getPublicHostedZoneName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

interface VpcClusterStackProps extends cdk.StackProps {}
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

		const publicZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
			hostedZoneId: getPublicHostedZoneId(),
			zoneName: getPublicHostedZoneName(),
		});

		const apiDomainName = getDomainNameWithPrefix("api");
		// cdk.Annotations.of(this).addError(apiDomainName);
		this.apiCertificate = new Certificate(this, "APICertificate", {
			domainName: apiDomainName,
			validation: CertificateValidation.fromDns(publicZone),
		});

		const keycloakDomainName = getDomainNameWithPrefix("keycloak");
		this.keycloakCertificate = new Certificate(this, "KeycloakCertificate", {
			domainName: keycloakDomainName,
			validation: CertificateValidation.fromDns(publicZone),
		});

		this.vpc = new Vpc(this, "VPC", {
			subnetConfiguration: [
				{
					name: "public-subnet",
					subnetType: SubnetType.PUBLIC,
					cidrMask: 24,
				},
				// Run Everything in public subnets for now
				// {
				// 	name: "private-subnet",
				// 	subnetType: SubnetType.PRIVATE_ISOLATED,
				// 	cidrMask: 24,
				// },
			],
			maxAzs: 2,
		});
		this.cluster = new Cluster(this, "Cluster", { vpc: this.vpc });

		this.backendLoadBalancer = new ApplicationLoadBalancer(this, "BackendLoadBalancer", {
			vpc: this.vpc,
			internetFacing: true,
		});
		this.keycloakLoadBalancer = new ApplicationLoadBalancer(this, "KeycloakLoadBalancer", {
			vpc: this.vpc,
			internetFacing: true,
		});

		new ARecord(this, "BackendALBAlias", {
			recordName: apiDomainName,
			zone: publicZone,
			comment: "Alias for Backend Load Balancer API",
			target: RecordTarget.fromAlias(new LoadBalancerTarget(this.backendLoadBalancer)),
		});

		new ARecord(this, "KeycloakALBAlias", {
			recordName: keycloakDomainName,
			zone: publicZone,
			comment: "Alias for Keycloack Load Balancer",
			target: RecordTarget.fromAlias(new LoadBalancerTarget(this.keycloakLoadBalancer)),
		});

		// Database Stack SGs
		this.databaseSG = new SecurityGroup(this, "DatabaseSG", {
			vpc: this.vpc,
			description: "Security group for database. NOTE: Open port 5432 to the internet to access the DB.",
			securityGroupName: "database-sg",
			allowAllOutbound: false,
		});
		this.databaseSG.addIngressRule(Peer.ipv4(this.vpc.vpcCidrBlock), Port.tcp(5432));
		// PUBLIC ACCESS!!!
		this.databaseSG.addIngressRule(Peer.anyIpv4(), Port.tcp(5432));

		// Backend Stack SGs
		this.backendServiceSG = new SecurityGroup(this, "BackendServiceSG", {
			vpc: this.vpc,
			description: "Security group for backend service.",
			securityGroupName: "backend-service-sg",
			allowAllOutbound: true,
		});
		this.backendServiceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(3000));

		// Keycloak Stack SGs
		this.keycloakServiceSG = new SecurityGroup(this, "KeycloakServiceSG", {
			vpc: this.vpc,
			description: "Security group for keycloak service.",
			securityGroupName: "keycloak-service-sg",
			allowAllOutbound: true,
		});
		this.keycloakServiceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(8080));
	}
}
