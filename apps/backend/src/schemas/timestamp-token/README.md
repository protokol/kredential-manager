# Timestamp Token data model

> JSON representation of timestamp token

    TSTInfo ::= SEQUENCE  {
       version                      INTEGER  { v1(1) },
       policy                       TSAPolicyId,
       messageImprint               MessageImprint,
         -- MUST have the same value as the similar field in
         -- TimeStampReq
       serialNumber                 INTEGER,
        -- Time-Stamping users MUST be ready to accommodate integers
        -- up to 160 bits.
       genTime                      GeneralizedTime,
       accuracy                     Accuracy                 OPTIONAL,
       ordering                     BOOLEAN             DEFAULT FALSE,
       nonce                        INTEGER                  OPTIONAL,
         -- MUST be present if the similar field was present
         -- in TimeStampReq.  In that case it MUST have the same value.
       tsa                          [0] GeneralName          OPTIONAL,
       extensions                   [1] IMPLICIT Extensions   OPTIONAL  }
