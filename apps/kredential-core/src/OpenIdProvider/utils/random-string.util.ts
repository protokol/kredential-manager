/**
 * This utility file contains the function `generateRandomString` which is used to generate
 * a random string of a specified length. The characters used in the generation include
 * uppercase letters (A-Z), lowercase letters (a-z), and digits (0-9).
 */

export function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}