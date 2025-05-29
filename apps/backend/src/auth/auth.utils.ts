import { JHeader } from "@protokol/kredential-core";

export async function mapHeadersToJwtHeader(
    headers: Record<string, string | string[]>,
): Promise<JHeader> {
    const jwtHeader: JHeader = { typ: "", alg: "", kid: "" };

    if (typeof headers["kid"] === "string") {
        jwtHeader.kid = headers["kid"];
    }
    if (typeof headers["alg"] === "string") {
        jwtHeader.alg = headers["alg"];
    }
    if (typeof headers["typ"] === "string") {
        jwtHeader.typ = headers["typ"];
    }

    return jwtHeader;
}

export function extractBearerToken(headers: { [key: string]: string }): string {
    const authorizationHeader = headers["authorization"];
    if (!authorizationHeader) {
        throw new Error("Authorization header is missing");
    }

    const tokenParts = authorizationHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        throw new Error("Authorization header is not a Bearer token");
    }

    const bearerToken = tokenParts[1];
    return bearerToken;
}

export function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
}

export function isVPTokenTest(scope: string): boolean {
    return scope?.includes("ver_test:vp_token");
}

export function isIDTokenTest(scope: string): boolean {
    return scope?.includes("ver_test:id_token");
}

export function isVPTokenInteroperabilityTest(scope: string): boolean {
    return scope?.includes("openid:interopTest");
}

export function isConformanceTestScope(scope: string): {
    isVPTokenTest: boolean;
    isIDTokenTest: boolean;
    isVPTokenInteroperabilityTest: boolean;
} {
    return {
        isVPTokenTest: isVPTokenTest(scope),
        isIDTokenTest: isIDTokenTest(scope),
        isVPTokenInteroperabilityTest: isVPTokenInteroperabilityTest(scope),
    };
}

export function validateClientId(client_id: string): boolean {
    // Check if it's a valid DID
    if (!client_id.startsWith("did:")) {
        return false;
    }

    // Split the DID into method and identifier
    const parts = client_id.split(":");
    if (parts.length < 3) {
        return false;
    }

    // Validate the DID method (e.g., 'key', 'web', etc.)
    const method = parts[1];
    if (!["key", "web", "ebsi"].includes(method)) {
        return false;
    }

    return true;
}
