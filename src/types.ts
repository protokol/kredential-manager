export type CredentialOffer = {
    credential_offer?: string;
    credential_offer_uri?: string;
};

export type CredentialOfferPayload = {
    credential_issuer: string;
    credentials: Array<{
        format: "jwt_vc";
        types: string[];
        trust_framework: {
            name: string;
            type: string;
            uri: string;
        };
    }>;
    grants: {
        authorization_code?: {
            issuer_state?: string;
        };
        "urn:ietf:params:oauth:grant-type:pre-authorized_code"?: {
            "pre-authorized_code": string;
            user_pin_required: boolean;
        };
    };
};
