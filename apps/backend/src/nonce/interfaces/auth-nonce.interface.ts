export interface AuthNonce {
    requestedCredentials: string[];
    redirectUri: string;
    serverDefinedState: string;
    clientDefinedState: string;
    codeChallenge: string;
}
