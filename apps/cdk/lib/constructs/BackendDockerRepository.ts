import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export class BackendDockerRepository extends Construct {
	public readonly image: ContainerImage;
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const backendDockerImage = new DockerImageAsset(this, "DockerImage", {
			directory: "../backend",
			file: "Dockerfile",
		});
		this.image = ContainerImage.fromDockerImageAsset(backendDockerImage);
	}
}
