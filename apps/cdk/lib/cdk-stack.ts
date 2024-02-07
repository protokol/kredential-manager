import { HelloLambda } from "./HelloLambda/HelloLambda";
import * as cdk from "aws-cdk-lib";
import { BasePathMapping, Cors, DomainName, EndpointType, RestApi, SecurityPolicy } from "aws-cdk-lib/aws-apigateway";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { CnameRecord, HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

const HOSTED_ZONE_ID = "Z08139353PYYZ63C4KDJW";
const ZONE_NAME = "eu-dev.protokol.sh";
const DOMAIN_NAME = "test.eu-dev.protokol.sh";
const RECORD_NAME = "test";
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

		const publicZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
			hostedZoneId: HOSTED_ZONE_ID,
			zoneName: ZONE_NAME,
		});

		const certificate = new Certificate(this, "Certificate", {
			domainName: DOMAIN_NAME,
			validation: CertificateValidation.fromDns(publicZone),
		});

		const domainName = new DomainName(this, "ApiGatewayCustomDomain", {
			domainName: DOMAIN_NAME,
			certificate: certificate,
			endpointType: EndpointType.REGIONAL,
			securityPolicy: SecurityPolicy.TLS_1_2,
		});

		new BasePathMapping(this, `Mapping${api.restApiName}`, {
			domainName: domainName,
			restApi: api,
		});

		new CnameRecord(this, "ApiGatewayRecordSet", {
			zone: publicZone,
			recordName: RECORD_NAME,
			domainName: domainName.domainNameAliasDomainName,
		});
	}
}
