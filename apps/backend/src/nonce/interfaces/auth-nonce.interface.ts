import { AuthorizationDetail } from "@probeta/mp-core";

export interface AuthNonce {
    authorizationDetails: AuthorizationDetail[];
    redirectUri: string;
    serverDefinedState: string;
    clientDefinedState: string;
    codeChallenge: string;
    idToken?: string;
}
