import { AwsLogDriver } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class Logging extends Construct {
	public readonly enterpriseWalletLogDriver: AwsLogDriver;
	public readonly keycloakLogDriver: AwsLogDriver;

	public readonly rpcLogDriver: AwsLogDriver;
	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.enterpriseWalletLogDriver = new AwsLogDriver({
			streamPrefix: "enterprise-wallet",
			logRetention: RetentionDays.THREE_DAYS,
		});
		this.keycloakLogDriver = new AwsLogDriver({
			streamPrefix: "keycloak",
			logRetention: RetentionDays.ONE_WEEK,
		});

		this.rpcLogDriver = new AwsLogDriver({
			streamPrefix: "rpc",
			logRetention: RetentionDays.ONE_WEEK,
		});
	}
}
