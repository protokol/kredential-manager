export type Credential = {
  id: string;
  holderDid: string;
  status: string;
  type: 'InTime' | 'Deferred' | 'PreAuth' | 'Verification';
  preAuthorized: boolean;
  deferred: boolean;
  offerUrl: string;
  pin: string | null;
  qrCode: string;
  credentialType: string;
  scope?: string;
};
