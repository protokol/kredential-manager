export enum VCStatus {
  PENDING = 'pending',
  APPROVED = 'issued',
  REJECTED = 'rejected'
}

export enum VCRole {
  STUDENT = 'student'
}

export type TUpdateStatusParams = {
  id: number;
  status: VCStatus;
};

export type TAttachDidParams = {
  did: string;
  studentId: number;
};

export type TStudentParams = {
  first_name: string;
  last_name: string;
  date_of_birth: Date | string;
  nationality: string;
  enrollment_date: string;
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dids?: any[];
};

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
