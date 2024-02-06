import * as cdk from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export class VpcClusterStack extends cdk.Stack {
	public readonly vpc: Vpc;
	public readonly cluster: Cluster;

	// SGs
	public readonly databaseSG: SecurityGroup;
	public readonly backendServiceSG: SecurityGroup;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

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
