import { JWTPayload } from "jose";

export interface IdTokenResponseDecoded extends JWTPayload {
    nonce: string;
}