import { JPayload } from './JPayload.interface';

export interface VCType {
    type: string[];
    [key: string]: any;
}

export interface VCPayload extends JPayload {
    vc?: VCType;
    exp?: number;
    nbf?: number;
}

export interface VP {
    '@context'?: string[];
    id?: string;
    type?: string[];
    holder: string;
    verifiableCredential: string[];
}

export interface VPPayload extends JPayload {
    vp: VP;
    nonce: string
}

export interface VPJWT {
    header: any;
    payload: VPPayload;
}

export interface VCJWT {
    header: any;
    payload: VCPayload;
}

export interface PathNested {
    format: 'jwt_vc';
    path: string;
}

export interface DescriptorMap {
    id: string;
    path: string;
    format: 'jwt_vp';
    path_nested: PathNested;
}

export interface PresentationSubmission {
    id: string;
    definition_id: string;
    descriptor_map: DescriptorMap[];
}