import { JPayload } from "@protokol/kredential-core";


export interface VCType {
    type: string[];
    [key: string]: any;
}

export interface VCPayload extends JPayload {
    vc?: VCType;
    exp?: number;
    nbf?: number;
}

export interface VPPayload extends JPayload {
    vp: {
        verifiableCredential: string[];
        '@context'?: string[];
        type?: string[];
        [key: string]: any;
    };
}

export interface VPJWT {
    header: any;
    payload: VPPayload;
}

export interface VCJWT {
    header: any;
    payload: VCPayload;
}