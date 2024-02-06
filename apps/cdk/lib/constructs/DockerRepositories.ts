import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export class DockerRepositories extends Construct {
	public readonly backendImage: ContainerImage;
	constructor(scope: Construct, id: string) {
		super(scope, id);
		const backendDockerImage = new DockerImageAsset(this, "BackendDockerImage", {
			directory: "../backend",
			file: "Dockerfile",
		});
		this.backendImage = ContainerImage.fromDockerImageAsset(backendDockerImage);
	}
}
