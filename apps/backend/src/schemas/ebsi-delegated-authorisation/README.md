# EBSI Verifiable Authorisation (with delegation)

> Schema of an EBSI Verifiable Authorisation with delegation capabilities

> This Verifiable Credential may be delegated to others, if some rules are followed.
>
> 1. The first issuer must be Root TAO or TAO.
> 2. Only owned rights may be delegated downwards
> 3. `maxDelegationCount` must be above 0.
> 4. Evidence must be attached into the delegated VC

## Changes

### 2023-09

- Define permissions
- Add evidence type extension
- Initial schema.
