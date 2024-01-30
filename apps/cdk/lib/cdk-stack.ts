import { HelloLambda } from "./HelloLambda/HelloLambda";
import * as cdk from "aws-cdk-lib";
import { Cors, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const api = new RestApi(this, "RestAPI", {
			restApiName: "PlaceholderAPI",
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS,
			},
		});

		new HelloLambda(this, "HelloLambdaConstruct", { api });
	}
}
