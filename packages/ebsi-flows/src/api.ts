import axios from "axios";

export function getOpenIdCredentialIssuer() {
    return axios.get(
        "https://api-conformance.ebsi.eu/conformance/v3/issuer-mock/.well-known/openid-credential-issuer",
    );
}

export function getOpenIdConfiguration() {
    return axios.get(
        "https://api-conformance.ebsi.eu/conformance/v3/auth-mock/.well-known/openid-configuration",
    );
}
