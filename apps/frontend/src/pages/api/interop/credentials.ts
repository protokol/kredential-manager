import type { NextApiRequest, NextApiResponse } from 'next';

type Credential = {
  type: string;
  status: string;
  preAuthorized: boolean;
  deferred: boolean;
  offerUrl: string;
  pin: string;
  qrCode: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Credential[] | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { holderDid } = req.body;

    if (!holderDid) {
      return res.status(400).json({ error: 'Holder DID is required' });
    }

    // This is a mock response - replace with your actual API call
    const mockCredentials: Credential[] = [
      {
        type: 'VerifiableCredential',
        status: 'active',
        preAuthorized: true,
        deferred: false,
        offerUrl: `openid-credential-offer://example.com/offer?credential_offer_uri=https://example.com/offers/${Date.now()}`,
        pin: '123456',
        qrCode:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAB9klEQVR42uyYMY7sIBBEq+VbcAluwaU4NJfgFtyCS3BoBt3BaFYz+2d/sBSpJWs0Gg1dpVd0N/yfr1+A/wD4nYDfBkB+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi0A+bUA5NcCkF8LQH4tAPm1AOTXApBfC0B+LQD5tQDk1wKQXwtAfi3gDxUgl5/POQJYAAAAAElFTkSuQmCC'
      }
    ];

    return res.status(200).json(mockCredentials);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
