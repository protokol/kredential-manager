import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import { importJWK, SignJWT } from "jose";
import axios from "axios";
import qs from "qs";
import { CredentialOffer, CredentialOfferPayload } from "../types";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { URLSearchParams } from "node:url";
import { base64url } from "multiformats/bases/base64";
import { getPrivateKeyJwkES256, getPublicKeyJwk } from "../utils";
import { getOpenIdConfiguration, getOpenIdCredentialIssuer } from "../api";

dotenv.config();

export const main = async (): Promise<void> => {
    /**
     * using user ES256 did2
     * */
    // const ethWallet = ethers.Wallet.createRandom();
    // console.log(ethWallet.mnemonic?.phrase)
    const ethWallet = ethers.Wallet.fromPhrase(
        "future liberty worry fade result one unfold remember trumpet dismiss damp boost",
    );
    const privateKeyHex = ethWallet.privateKey;
    const privateKeyJwk = getPrivateKeyJwkES256(privateKeyHex);
    const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, "ES256");

    const did = EbsiWallet.createDid("NATURAL_PERSON", publicKeyJwk);
    console.log(did);

    //--------------------------------
    /**
     * conformance issuerMockInitiateCredentialOffer https://api-conformance.ebsi.eu/conformance/v3/issuer-mock/initiate-credential-offer CTWalletCrossInTime
     * */
    const initiateCredentialOfferEndpoint =
        "https://api-conformance.ebsi.eu/conformance/v3/issuer-mock/initiate-credential-offer";
    const credentialType = "CTWalletCrossInTime";
    const requestParams = {
        credential_type: credentialType,
        credential_offer_endpoint: "openid-credential-offer://",
        client_id: did,
    };
    const res = await axios.get(
        `${initiateCredentialOfferEndpoint}?${qs.stringify(requestParams)}`,
    );
    console.log(res.data);

    let search: string;
    if (credentialType.startsWith("CTWalletSame")) {
        search = new URL((res.headers as { location: string }).location).search;
    } else {
        search = new URL(res.data as string).search;
    }
    const parsedCredentialOffer = qs.parse(search.slice(1)) as CredentialOffer;
    console.log(parsedCredentialOffer);
    const respCredentialPayload = await axios.get(
        parsedCredentialOffer.credential_offer_uri!,
    );
    const credentialPayload =
        respCredentialPayload.data as CredentialOfferPayload;
    console.log(credentialPayload);
    //--------------------------------
    /**
     * Get configurations
     * */
    const respOpenIdCredentialIssuer = await getOpenIdCredentialIssuer();
    console.log(JSON.stringify(respOpenIdCredentialIssuer.data, null, 4));

    console.log("--------------------------------------------------");
    const respOpenIdConfiguration = await getOpenIdConfiguration();
    console.log(JSON.stringify(respOpenIdConfiguration.data, null, 4));
    //--------------------------------
    const openIdCredentialIssuer = respOpenIdCredentialIssuer.data;
    const openIdConfiguration = respOpenIdConfiguration.data;
    const requestedTypes = [
        "VerifiableCredential",
        "VerifiableAttestation",
        "CTWalletCrossInTime",
    ];
    const inputAlg = "ES256";
    const codeVerifier = randomBytes(50).toString("base64url");
    const issuerState =
        credentialPayload.grants.authorization_code?.issuer_state;

    const isPKCEChallenge = !!codeVerifier;

    const authorizationServer =
        openIdCredentialIssuer.authorization_server ??
        openIdCredentialIssuer.credential_issuer;

    const clientId = did;
    let codeChallenge = "";
    if (isPKCEChallenge) {
        codeChallenge = base64url.baseEncode(
            createHash("sha256").update(codeVerifier).digest(),
        );
    }

    const clientMetadata = isPKCEChallenge
        ? {
              authorization_endpoint: "openid:",
          }
        : {
              redirect_uris: [`${clientId}/code-cb`],
              jwks_uri: `${clientId}/jwks`,
              authorization_endpoint: `${clientId}/authorize`,
          };
    const authorizationDetails = [
        {
            type: "openid_credential",
            format: "jwt_vc",
            locations: [openIdCredentialIssuer.credential_issuer],
            types: requestedTypes,
        },
    ];

    const queryParams = {
        scope: "openid",
        client_id: clientId,
        client_metadata: JSON.stringify(clientMetadata),
        redirect_uri: isPKCEChallenge
            ? "openid://callback"
            : `${clientId}/code-cb`,
        response_type: "code",
        state: randomUUID(),
        ...(isPKCEChallenge && {
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        }),
        ...(issuerState && { issuer_state: issuerState }),
        authorization_details: JSON.stringify(authorizationDetails),
    };
    const jwtPayload = {
        ...queryParams,
        client_metadata: clientMetadata,
        authorization_details: authorizationDetails,
    };

    const clientPrivateKey = await importJWK(privateKeyJwk, inputAlg);

    const requestParam = await new SignJWT(jwtPayload)
        .setProtectedHeader({
            typ: "JWT",
            alg: inputAlg,
            kid: isPKCEChallenge ? privateKeyJwk.kid : privateKeyJwk.kid, //todo
        })
        .setIssuer(clientId)
        .setAudience(authorizationServer)
        .sign(clientPrivateKey);

    const responseAuthorize = await axios.get(
        `${openIdConfiguration.authorization_endpoint}?${new URLSearchParams({
            ...queryParams,
            request: requestParam,
        } as unknown as URLSearchParams).toString()}`,
        {
            validateStatus: function (status) {
                return status >= 200 && status <= 302;
            },
            maxRedirects: 0,
        },
    );

    const { location } = responseAuthorize.headers as { [x: string]: string };
    const locationUrl = new URL(location);
    if (locationUrl.searchParams.get("error"))
        throw new Error(locationUrl.searchParams.toString());
    const responseQueryParams = qs.parse(locationUrl.search.substring(1));
    console.log(responseQueryParams);
    console.log(responseQueryParams.state);
    //--------------------------------
    /**
     * ==> conformance authMockDirectPostIdToken {"authorization_server":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock","credential_issuer":"https://api-conformance.ebsi.eu/conformance/v3/issuer-mock"} {"redirect_uris":["https://api-conformance.ebsi.eu/conformance/v3/auth-mock/direct_post"]} {"state":"fb1a71fa-43af-497f-9e84-a9c093c9ca0f","client_id":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock","redirect_uri":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock/direct_post","response_type":"id_token","response_mode":"direct_post","scope":"openid","nonce":"ac4db8ce-fdfb-4dab-9a43-7b9b8ae03afb","request_uri":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock/request_uri/8d8a8662-4081-4cbf-92a1-8d52d19b068f"} ES256
     * */
    const { state, nonce } = responseQueryParams;
    const idTokenDirectPost = await new SignJWT({
        nonce: nonce?.toString(),
        sub: did,
    })
        .setProtectedHeader({
            typ: "JWT",
            alg: inputAlg,
            kid: did + "#" + did.split(":")[2],
        })
        .setIssuer(did)
        .setAudience(authorizationServer)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(clientPrivateKey);
    console.log(idTokenDirectPost);
    const data = new URLSearchParams({
        id_token: idTokenDirectPost,
        state: state!.toString(),
    }).toString();
    console.log(queryParams.state);
    const responseDirectPost = await axios.post(
        openIdConfiguration.redirect_uris[0],
        data,
        {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            validateStatus: function (status) {
                return status >= 200 && status <= 302;
            },
            maxRedirects: 0,
        },
    );
    const data2 = responseDirectPost.headers as { [x: string]: string };
    const location2 = data2.location;

    const locationUrl2 = new URL(location2);
    if (locationUrl2.searchParams.get("error"))
        throw new Error(locationUrl2.searchParams.toString());
    const responseQueryParams2 = qs.parse(locationUrl2.search.substring(1));

    console.log(responseQueryParams2);

    //--------------------------------
    /**
     * ==> conformance authMockToken {"authorization_server":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock","credential_issuer":"https://api-conformance.ebsi.eu/conformance/v3/issuer-mock"} {"token_endpoint":"https://api-conformance.ebsi.eu/conformance/v3/auth-mock/token"} fb04b2c6-dfc4-466a-bcb1-0478135c3781 ES256 wihtg4aLjqPrqdB0O-dRTMU5mND3PHVsu3mXAVo1GWZ40BBidGrDYkAiRK-dKEF3qiY
     * */
    const queryParams2 = {
        grant_type: "authorization_code",
        code: responseQueryParams2.code,
        client_id: did,
        ...(!isPKCEChallenge && {
            client_assertion_type:
                "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        }),
        ...(isPKCEChallenge && {
            code_verifier: codeVerifier,
        }),
    };
    const jwtPayload2 = {
        ...queryParams2,
    };
    const clientAssertion = await new SignJWT(jwtPayload2)
        .setProtectedHeader({
            typ: "JWT",
            alg: inputAlg,
            kid: did,
        })
        .setIssuer(did)
        .setAudience(authorizationServer)
        .setSubject(did)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(clientPrivateKey);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const params = new URLSearchParams({
        ...queryParams2,
        client_assertion: clientAssertion,
    }).toString();
    const responseToken = await axios.post(
        openIdConfiguration.token_endpoint,
        params,
        {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
        },
    );
    console.log(responseToken.data);
    //--------------------------------
    /**
     * ==> conformance issuerMockCredential {"credential_issuer":"https://api-conformance.ebsi.eu/conformance/v3/issuer-mock"} d09c6c6e-f7fe-4f45-aad3-96963665a8d6 ["VerifiableCredential","VerifiableAttestation","CTWalletCrossInTime"] ES256
     * */
    console.log(nonce);
    const proofJwt = await new SignJWT({ nonce: responseToken.data.c_nonce })
        .setProtectedHeader({
            typ: "openid4vci-proof+jwt",
            alg: inputAlg,
            kid: did + "#" + did.split(":")[2],
        })
        .setIssuer(clientId)
        .setAudience(openIdCredentialIssuer.credential_issuer)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(clientPrivateKey);

    console.log(responseToken.data.access_token);
    const responseCredential = await axios.post(
        `${openIdCredentialIssuer.credential_issuer}/credential`,
        {
            types: requestedTypes,
            format: "jwt_vc",
            proof: {
                proof_type: "jwt",
                jwt: proofJwt,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${responseToken.data.access_token}`,
            },
        },
    );
    console.log(responseCredential.data);
};

void main();
