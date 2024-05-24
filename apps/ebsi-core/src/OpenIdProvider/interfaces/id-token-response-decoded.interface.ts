import { JWTPayload } from "./JWTPayload.interface";

export interface IdTokenResponseDecoded extends JWTPayload {
    nonce: string;
}