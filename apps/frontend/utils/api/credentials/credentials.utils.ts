export const getStatusFilter = (statuses: string[]): string =>
  `status:in:${statuses.join(',')}`;
