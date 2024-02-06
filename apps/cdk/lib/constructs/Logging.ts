import { AwsLogDriver } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class Logging extends Construct {
	public readonly enterpriseWalletLogDriver;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.enterpriseWalletLogDriver = new AwsLogDriver({
			streamPrefix: "enterprise-wallet",
			logRetention: RetentionDays.THREE_DAYS,
		});
	}
}
