# EBSI Verifiable Attestation

> Schema of an EBSI Verifiable Attestation

## Changes

### 2024-01 (VCDM 1.1)

VCDM1.1 with latest capabilities

- `issuer` can be a URI or an object
- `credentialSubject` can contain single or multiple subjects
- `proof` is removed
- `evidence` can contain single or multiple evidences

### 2023-10 (VCDM 2.0)

- Update `@context` to only be set

### 2023-09 (VCDM 2.0)

- Update `evidence` to contain one or many objects

### 2023-08 (VCDM 2.0)

The purpose is to transition to W3C Verifiable Credentials Data Model V2.0.

- Remove the `issuanceDate`, `expirationDate`, and `issued` properties
- Update the requirement for the @context
- Extend the `issuer` property: can be a URI or an object. Object MUST have an id property
- Make the `proof` property more generic
- Allow `credentialSubject` property to be an array of objects or an object
- Migrate to [JsonSchema](https://www.w3.org/TR/vc-json-schema/#jsonschema)
- Update examples
- Add ShaclValidator2017

### 2022-11_01 (VCDM 1.1)

- Improve descriptions on several fields
- modify `credentialSchema` to support single object or array of objects
  - will contain `type schema` and optionally `type extensions schema`
- add `termsOfUse`, to be used with `type extensions`
- evidence `id` is optional
- Removed `credentialStatus` StatusList2021Credential specification, as it is a type extension

### 2022-11

- Pump to json-schema 2020-12

### 2022-08

- Added the following `credentialStatus` attributes: `statusPurpose`, `statusListIndex`, `statusListCredential`.

### 2022-05

- Added `validUntil` property.
- Removed the following `evidence` attributes: `verifier`, `evidenceDocument`, `subjectPresence`, `documentPresence`.

### 2022-02

- Changed `$schema` to `draft-07`.
- Added `issued` property.
- Made the following `evidence` attributes required: `verifier`, `evidenceDocument`, `subjectPresence`, `documentPresence`.

### 2021-11

Initial schema.
