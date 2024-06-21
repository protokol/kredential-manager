import { JwtPayload } from "./JwtPayload.interface";
export interface IdTokenResponseDecoded extends JwtPayload {
    nonce: string;
}