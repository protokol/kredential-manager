import * as cdk from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

const HOSTED_ZONE_ID = "Z08139353PYYZ63C4KDJW";
const ZONE_NAME = "eu-dev.protokol.sh";
const DOMAIN_NAME = "api.eu-dev.protokol.sh";

export class VpcClusterStack extends cdk.Stack {
	public readonly vpc: Vpc;
	public readonly cluster: Cluster;

	// Load Balancers
	public readonly externalLoadBalancer: ApplicationLoadBalancer;

	// Certificates
	public readonly certificate: Certificate;

	// SGs
	public readonly databaseSG: SecurityGroup;
	public readonly backendServiceSG: SecurityGroup;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const publicZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
			hostedZoneId: HOSTED_ZONE_ID,
			zoneName: ZONE_NAME,
		});

		this.certificate = new Certificate(this, "Certificate", {
			domainName: DOMAIN_NAME,
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

		this.externalLoadBalancer = new ApplicationLoadBalancer(this, "ExternalLoadBalancer", {
			vpc: this.vpc,
			internetFacing: true,
		});

		new ARecord(this, "ALBAlias", {
			recordName: DOMAIN_NAME,
			zone: publicZone,
			comment: "Alias for API ALB",
			target: RecordTarget.fromAlias(new LoadBalancerTarget(this.externalLoadBalancer)),
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
	}
}
