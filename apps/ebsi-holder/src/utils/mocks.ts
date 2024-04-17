export const MOCK_DID_KEY = "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbns7ZWNqwNNXRVtDg4wQYHxn2NGgqcTG5ehNhytKPrBdEw2mpy65bAdPKxFAZPbSTkLi6rPrkGjCXXTKz4hDvPBiWXHmR1CUgdJuXPjRn9S1ooLvYzKbv5P5zxMzzkEGiqJ"

export const MOCK_DID_KEY_PRIVATE_KEY_JWK = { // TODO REGENERATE
    crv: 'P-256',
    kty: 'EC',
    x: 'OzQvNoWr_2wLXNyTa50ag7rJcsd8k1kOmplL4u9nZwE',
    y: 'D5BllqU5L49CtStMkjhENUwrE9gxyqPd8Lyyfwuv9rk',
    d: '51mQxyVIxo2iGIsB5mXvTEESeSYNzS_EEHVDsyIM8s8',
    kid: MOCK_DID_KEY // KID is the DID when using did:key
}
export const MOCK_REQUESTED_TYPES = [
    "VerifiableCredential",
    "VerifiableAttestation",
    "CTWalletCrossAuthorisedInTime",
]

