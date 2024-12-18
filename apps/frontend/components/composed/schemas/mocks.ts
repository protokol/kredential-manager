export const studentIdCardMock = {
  name: 'Schema_StudentIDCard',
  version: '1.0',
  schema: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: '<uuid>',
    type: ['VerifiableCredential', 'VerifiableAttestation', 'StudentIDCard'],
    issuer: {
      id: '<issuerDid>'
    },
    issuanceDate: '<timestamp>',
    credentialSubject: {
      id: '<subjectDid>',
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
      studentID: '{{studentID}}',
      program: '{{program}}'
    },
    credentialSchema: {
      id: 'https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD',
      type: 'FullJsonSchemaValidator2021'
    }
  },
  validationRules: {
    firstName: {
      type: 'string',
      required: true,
      minLength: 2
    },
    lastName: {
      type: 'string',
      required: true,
      minLength: 2
    },
    studentID: {
      type: 'string',
      required: true,
      minLength: 5
    },
    program: {
      type: 'string',
      required: true,
      minLength: 5
    }
  },
  trust_framework: {
    name: 'Template Organization Name',
    type: 'Template Organization Type',
    uri: 'https://www.template-organization-uri.example'
  },
  display: [
    {
      name: 'Template Organization Name',
      locale: 'en'
    }
  ],
  issuance_criteria: 'Template issuance criteria',
  supported_evidence_types: [
    'Template Evidence Type 1',
    'Template Evidence Type 2'
  ],
  format: 'jwt_vc'
};

export const courseCompletionMock = {
  name: 'Schema_CourseCompletitionCertificate',
  version: '1.0',
  schema: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: '<uuid>',
    type: [
      'VerifiableCredential',
      'VerifiableAttestation',
      'CourseCompletitionCertificate'
    ],
    issuer: {
      id: '<issuerDid>'
    },
    issuanceDate: '<timestamp>',
    credentialSubject: {
      id: '<subjectDid>',
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
      courseName: '{{courseName}}',
      instructor: '{{instructor}}'
    },
    credentialSchema: {
      id: 'https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD',
      type: 'FullJsonSchemaValidator2021'
    }
  },
  validationRules: {
    firstName: {
      type: 'string',
      required: true,
      minLength: 2
    },
    lastName: {
      type: 'string',
      required: true,
      minLength: 2
    },
    courseName: {
      type: 'string',
      required: true,
      minLength: 5
    },
    instructor: {
      type: 'string',
      required: true,
      minLength: 5
    }
  },
  trust_framework: {
    name: 'Template Organization Name',
    type: 'Template Organization Type',
    uri: 'https://www.template-organization-uri.example'
  },
  display: [
    {
      name: 'Template Organization Name',
      locale: 'en'
    }
  ],
  issuance_criteria: 'Template issuance criteria',
  supported_evidence_types: [
    'Template Evidence Type 1',
    'Template Evidence Type 2'
  ],
  format: 'jwt_vc'
};

export const libraryAccessMock = {
  name: 'Schema_LibraryAccessCredential',
  version: '1.0',
  schema: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: '<uuid>',
    type: [
      'VerifiableCredential',
      'VerifiableAttestation',
      'LibraryAccessCredential'
    ],
    issuer: {
      id: '<issuerDid>'
    },
    issuanceDate: '<timestamp>',
    credentialSubject: {
      id: '<subjectDid>'
    },
    credentialSchema: {
      id: 'https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD',
      type: 'FullJsonSchemaValidator2021'
    }
  },
  validationRules: {},
  trust_framework: {
    name: 'Template Organization Name',
    type: 'Template Organization Type',
    uri: 'https://www.template-organization-uri.example'
  },
  display: [
    {
      name: 'Template Organization Name',
      locale: 'en'
    }
  ],
  issuance_criteria: 'Template issuance criteria',
  supported_evidence_types: [
    'Template Evidence Type 1',
    'Template Evidence Type 2'
  ],
  format: 'jwt_vc'
};
