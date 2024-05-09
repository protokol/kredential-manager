import { AuthorizationDetail } from "@protokol/ebsi-core";

export interface AuthNonce {
    authorizationDetails: AuthorizationDetail[];
    redirectUri: string;
    serverDefinedState: string;
    clientDefinedState: string;
    codeChallenge: string;
    idToken?: string;
}
