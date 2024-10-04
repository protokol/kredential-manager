import { generateName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { EnvironmentConfig } from "config";
import { Construct } from "constructs";

interface DatabaseStackProps extends cdk.StackProps {
	vpc: Vpc;
	databaseSG: SecurityGroup;
	config: EnvironmentConfig;
}
export class DatabaseStack extends cdk.Stack {
	public readonly dbInstance: DatabaseInstance;

	constructor(scope: Construct, id: string, props: DatabaseStackProps) {
		super(scope, id, props);
		const { vpc, databaseSG, config } = props;
		const { stage, db } = config;

		// Define database engine and instance type
		const databaseEngine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_14 });
		const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
		const databaseName = db.name;
		const databasePort = db.port;

		// Retrieve the database master secret
		const databaseMasterSecret = Secret.fromSecretNameV2(this, "DatabaseMasterSecret", `${stage}/database/master`);
		const databaseCredentials = Credentials.fromSecret(databaseMasterSecret);

		// Create the database instance
		this.dbInstance = new DatabaseInstance(this, generateName(id, "Database"), {
			vpc,
			vpcSubnets: { subnetType: SubnetType.PUBLIC },
			publiclyAccessible: true,
			securityGroups: [databaseSG],
			databaseName,
			instanceType,
			engine: databaseEngine,
			port: databasePort,
			credentials: databaseCredentials,
			backupRetention: Duration.days(0), // Disable automatic DB snapshot retention
			deleteAutomatedBackups: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});
	}
}
