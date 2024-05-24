import { createHash, randomBytes } from 'node:crypto';

/**
 * Generates a code verifier.
 * @returns {string} - The code verifier. 
 */
export async function generateCodeVerifier(): Promise<string> {
    return randomBytes(50).toString("base64url");
}
/**
 * Generates a code challenge from a code verifier.
 * @param {string} codeVerifier - The code verifier.
 * @returns {string} - The code challenge.
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const hash = createHash("sha256");
    hash.update(codeVerifier);
    return hash.digest().toString('base64url');
}
