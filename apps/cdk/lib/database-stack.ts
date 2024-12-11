import { generateName } from "./utils";
import * as cdk from "aws-cdk-lib";
import { CustomResource, Duration } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Provider } from "aws-cdk-lib/custom-resources";
import { EnvironmentConfig } from "config/types";
import { Construct } from "constructs";
import * as path from "path";

interface DatabaseStackProps extends cdk.StackProps {
	vpc: Vpc;
	databaseSG: SecurityGroup;
	lambdaSG: SecurityGroup;
	config: EnvironmentConfig;
	databaseMasterSecret: Secret;
}
export class DatabaseStack extends cdk.Stack {
	public readonly dbInstance: DatabaseInstance;

	constructor(scope: Construct, id: string, props: DatabaseStackProps) {
		super(scope, id, props);
		const { vpc, databaseSG, lambdaSG, config, databaseMasterSecret } = props;
		const STAGE = config.APP_CONFIG.STAGE;
		const KM_DB_NAME = config.APP_CONFIG.KM_DB_NAME;
		const KM_DB_PORT = config.APP_CONFIG.KM_DB_PORT;

		// Define database engine and instance type
		const databaseEngine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_14 });
		const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);

		// Retrieve the database master secret
		const dbMS = Secret.fromSecretNameV2(this, "DatabaseMasterSecret", `${STAGE}/database/master`);
		const databaseCredentials = Credentials.fromSecret(dbMS);

		// Create the database instance
		this.dbInstance = new DatabaseInstance(this, generateName(id, "Database"), {
			vpc,
			vpcSubnets: { subnetType: SubnetType.PUBLIC },
			publiclyAccessible: true,
			securityGroups: [databaseSG],
			databaseName: KM_DB_NAME,
			instanceType,
			engine: databaseEngine,
			port: KM_DB_PORT,
			credentials: databaseCredentials,
			backupRetention: Duration.days(0), // Disable automatic DB snapshot retention
			deleteAutomatedBackups: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// Create the Lambda execution role
		const executionRole = new iam.Role(this, "LambdaExecutionRole", {
			assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
			managedPolicies: [
				iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
				iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
			],
		});
		executionRole.addToPolicy(
			new PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: ["secretsmanager:GetSecretValue"],
				resources: [databaseMasterSecret.secretArn],
			}),
		);

		// Create the Lambda function
		const createSchemaFunction = new NodejsFunction(this, generateName(id, "CreateSchemaFunction"), {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: "handler",
			entry: path.join(__dirname, "./lambda/create-schemas.ts"),
			bundling: {
				externalModules: [],
			},
			environment: {
				DB_SECRET_ARN: databaseMasterSecret.secretArn,
			},
			timeout: Duration.minutes(5),
			vpc,
			vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
			securityGroups: [lambdaSG],
			allowPublicSubnet: true,
			role: executionRole,
		});

		// Trigger the Lambda function on stack creation
		const provider = new Provider(this, "Provider", {
			onEventHandler: createSchemaFunction,
		});

		const customResource = new CustomResource(this, "CustomResource", {
			serviceToken: provider.serviceToken,
		});

		customResource.node.addDependency(this.dbInstance);
	}
}
