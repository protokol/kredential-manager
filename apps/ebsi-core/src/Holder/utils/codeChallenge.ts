// import CryptoJS from 'crypto-js';
// /**
//  * Generates a code challenge from a code verifier.
//  * @param {string} codeVerifier - The code verifier.
//  * @returns {string} - The code challenge.
//  */
// export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
//     const hash = CryptoJS.SHA256(codeVerifier);
//     const base64String = hash.toString(CryptoJS.enc.Base64);
//     const codeChallenge = base64String
//         .replace(/\+/g, '-')
//         .replace(/\//g, '_')
//         .replace(/=+$/, '');
//     return codeChallenge;
// }