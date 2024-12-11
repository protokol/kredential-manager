import type { SortingState } from '@tanstack/react-table';

export const mapTableSortToKey = (sort?: SortingState) => {
  const sortKey = sort?.find(Boolean);
  if (!sortKey) return undefined;

  const sortId = sortKey.id;
  const sortDirection = sortKey.desc ? 'desc' : 'asc';

  return `${sortId}.${sortDirection}`;
};
