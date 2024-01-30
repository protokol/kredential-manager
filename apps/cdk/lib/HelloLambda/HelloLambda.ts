import { Duration } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export interface HelloLambdaProps {
	api: RestApi;
}

export class HelloLambda extends Construct {
	constructor(
		scope: Construct,
		id: string,
		private readonly props: HelloLambdaProps,
	) {
		super(scope, id);

		const func = new NodejsFunction(this, "HelloLambda", {
			entry: path.resolve(__dirname, "Hello.lambda.ts"),
			timeout: Duration.seconds(5),
			runtime: Runtime.NODEJS_20_X,
			initialPolicy: [],
		});

		this.props.api.root.resourceForPath("/hello").addMethod("GET", new LambdaIntegration(func));
	}
}
