import { JPayload } from "./JPayload.interface";
export interface IdTokenResponseDecoded extends JPayload {
    nonce: string;
}