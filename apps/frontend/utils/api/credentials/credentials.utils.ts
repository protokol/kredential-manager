export const getStatusFilter = (statuses: string[]): string =>
  statuses.length ? `status:in:${statuses.join(',')}` : '';
