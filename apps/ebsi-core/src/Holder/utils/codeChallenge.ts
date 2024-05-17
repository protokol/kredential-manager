import { createHash } from 'node:crypto';
/**
 * Generates a code challenge from a code verifier.
 * @param {string} codeVerifier - The code verifier.
 * @returns {string} - The code challenge.
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const hash = createHash("sha256");
    hash.update(codeVerifier);
    const digest = hash.digest();
    const codeChallenge = digest.toString('base64url');
    return codeChallenge;
}