import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random string
 * @param length The length of the string to generate
 * @param numbersOnly If true, generates only numeric characters
 * @returns A random string
 */
export function generateRandomString(length: number, numbersOnly: boolean = false): string {
    if (numbersOnly) {
        // Generate numeric PIN code (0-9)
        return Array.from(
            { length },
            () => Math.floor(randomBytes(1)[0] / 256 * 10).toString()
        ).join('');
    }

    // Generate base64url string
    return randomBytes(Math.ceil(length * 3 / 4))
        .toString('base64url')
        .slice(0, length);
}