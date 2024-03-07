export function getStackName(stack: string): string {
	return process.env.STAGE_NAME ? `${process.env.STAGE_NAME}${stack}` : stack;
}
