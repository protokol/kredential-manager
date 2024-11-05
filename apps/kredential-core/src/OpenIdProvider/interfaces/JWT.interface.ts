import { JHeader } from "./JHeader.interface";
import { JPayload } from "./JPayload.interface";

export interface JWT {
    header: JHeader;
    payload: JPayload;
    signature?: string;
}