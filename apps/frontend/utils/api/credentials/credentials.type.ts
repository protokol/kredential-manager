export enum VCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum VCRole {
  STUDENT = 'student'
}

export const StatusOptions = [
  {
    value: VCStatus.PENDING,
    label: 'Pending'
  },
  {
    value: VCStatus.APPROVED,
    label: 'Approved'
  },
  {
    value: VCStatus.REJECTED,
    label: 'Rejected'
  }
];

export type TGetVCListParams = {
  page?: number;
  size?: number;
  status?: VCStatus;
  role?: VCRole;
  filter?: string;
};

export type PaginatedResource<T> = {
  totalItems: number;
  items: T[];
  page: number;
  size: number;
};

export type TVCredential = {
  // eslint-disable-next-line
  did: any;
  id: number;
  displayName: string;
  mail: string;
  created_at: number;
  updated_at: number;
  dateOfBirth: Date;
  type: string;
  role: VCRole;
  status: VCStatus;
};

export type TVCCount = {
  count: string;
  status: VCStatus;
};

export type TVCCountList = {
  count: TVCCount[];
};
