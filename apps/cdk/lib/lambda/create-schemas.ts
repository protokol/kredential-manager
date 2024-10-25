import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { Handler } from "aws-lambda";
import { Client } from "pg";

interface EnvironmentVariables {
    DB_SECRET_ARN: string;
    AWS_REGION: string;
}

const getEnv = (key: keyof EnvironmentVariables): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};

export const handler: Handler = async () => {
    try {

        const secretsManagerClient = new SecretsManagerClient({ region: getEnv("AWS_REGION") });
        const secretArn = process.env.DB_SECRET_ARN;
        if (!secretArn) {
            throw new Error("DB_SECRET_ARN environment variable is not set");
        }
        const command = new GetSecretValueCommand({ SecretId: secretArn });
        const secretValue = await secretsManagerClient.send(command);
        const secret = JSON.parse(secretValue.SecretString || "{}");

        const client = new Client({
            host: secret.host,
            port: parseInt(process.env.KM_DB_PORT || "5432", 10),
            user: secret.username,
            password: secret.password,
            database: secret.dbname,
        });


        const maxRetries = 30;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                await client.connect();
                break;
            } catch (err) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new Error("Failed to connect to the database after multiple attempts");
                }
                await new Promise(res => setTimeout(res, 10000));
            }
        }

        const schemas = ["kc", "km"];
        for (const schema of schemas) {
            await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        }
        await client.end();
    } catch (err) {
        console.error("Error creating schemas:", err);
        throw err;
    }
};
