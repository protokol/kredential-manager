import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export class PublicDockerRepositories extends Construct {
	public readonly keycloackImage: ContainerImage;
	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.keycloackImage = ContainerImage.fromRegistry("quay.io/keycloak/keycloak");
	}
}
