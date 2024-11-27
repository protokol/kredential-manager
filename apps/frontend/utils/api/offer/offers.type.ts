export enum TGrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  PRE_AUTHORIZED_CODE = 'urn:ietf:params:oauth:grant-type:pre-authorized_code'
}

export type TTrustFramework = {
  name: string;
  type: string;
  uri: string;
};

export type TAttachDidParams = {
  did: string;
  studentId: number;
};

export type TOfferData = {
  did: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | string;
  nationality: string;
  enrollment_date: string;
  email: string;
};

export type TOfferParams = {
  schemaId: string;
  data: TOfferData;
  grantType: TGrantType;
  trustFramework?: TTrustFramework;
};

export type PaginatedResource<T> = {
  totalItems: number;
  items: T[];
  page: number;
  size: number;
};
