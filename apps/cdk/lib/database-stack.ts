import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface DatabaseStackProps extends cdk.StackProps {
	vpc: Vpc;
	databaseSG: SecurityGroup;
}
export class DatabaseStack extends cdk.Stack {
	public readonly dbInstance: DatabaseInstance;
	constructor(scope: Construct, id: string, props: DatabaseStackProps) {
		super(scope, id, props);
		const engine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_14 });
		const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
		const port = 5432;

		const masterUserSecret = new Secret(this, "DatabaseMasterSecret", {
			description: "Database master credentials",
			generateSecretString: {
				secretStringTemplate: JSON.stringify({ username: "enterprisewalletuser" }),
				generateStringKey: "password",
				passwordLength: 32,
				excludePunctuation: true,
			},
		});

		this.dbInstance = new DatabaseInstance(this, "Database", {
			vpc: props.vpc,
			// Run Everything in public subnets for now and disable access with security groups
			vpcSubnets: { subnetType: SubnetType.PUBLIC },
			publiclyAccessible: true,
			securityGroups: [props.databaseSG],
			databaseName: "enterprisewallet",
			instanceType,
			engine,
			port,
			credentials: Credentials.fromSecret(masterUserSecret),
			backupRetention: Duration.days(0), // disable automatic DB snapshot retention
			deleteAutomatedBackups: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});
	}
}
