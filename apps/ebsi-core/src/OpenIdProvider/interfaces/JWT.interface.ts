import { JwtHeader } from "./JwtHeader.interface";
import { JwtPayload } from "./JwtPayload.interface";

export interface JWT {
    header: JwtHeader;
    payload: JwtPayload;
    signature?: string;
}