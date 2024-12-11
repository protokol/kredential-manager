import { AuthorizationDetail } from "@protokol/kredential-core";

export interface AuthNonce {
    authorizationDetails: AuthorizationDetail[];
    redirectUri: string;
    serverDefinedState: string;
    clientDefinedState: string;
    codeChallenge: string;
    idToken?: string;
}
