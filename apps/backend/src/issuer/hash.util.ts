
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

/**
 * 
 * @param codeChallenge - The code challenge.
 * @param codeVerifier - The code verifier .
 * @returns {boolean} - True if the code challenge is valid, false otherwise.   
 */
export async function validateCodeChallenge(codeChallenge: string, codeVerifier: string): Promise<boolean> {
    const generatedChallenge = await generateCodeChallenge(codeVerifier);
    const base64UrlChallenge = Buffer.from(generatedChallenge).toString('base64url');
    return codeChallenge === base64UrlChallenge;
}