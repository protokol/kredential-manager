export const MOCK_DID_KEY = "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbsqjbZPkPLK6SjrGKquTqYaDuzF4u8yd4uqb396uThfXQcLEv27HkA9Fqq3o7wwY7iEtpaUp1BMpD3uFHM7PJ27HPKJfKLosmMDjVFh9baiMLNrMqoe5HYBW66pRRTRMu6k"

export const MOCK_DID_KEY_PRIVATE_KEY_JWK = { // TODO REGENERATE
    kty: 'EC',
    crv: 'P-256',
    x: 'v-HWwjfXum3vQqFGtIcqxdS0mNJ8PxTviG3H2Z_iNbM',
    y: 'M7Sa0BZeXv0hKaxFwoIL5t3cO69UG5cbQRBpADciChE',
    d: 'HjUN2btYYoHULAtJDoij_9GXZRrjDs-sJL6SmqXpEGY',
    kid: MOCK_DID_KEY // KID is the DID when using did:key
}

export const MOCK_DID_KEY_PUBLIC_KEY_JWK = {
    alg: 'ES256',
    kid: 'test',
    kty: 'EC',
    crv: 'P-256',
    x: 'v-HWwjfXum3vQqFGtIcqxdS0mNJ8PxTviG3H2Z_iNbM',
    y: 'M7Sa0BZeXv0hKaxFwoIL5t3cO69UG5cbQRBpADciChE'
}
export const MOCK_REQUESTED_TYPES = [
    "VerifiableCredential",
    "VerifiableAttestation",
    "CTWalletCrossAuthorisedInTime",
]

