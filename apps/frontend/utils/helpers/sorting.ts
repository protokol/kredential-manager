import type { SortDirection } from '@tanstack/react-table';

export const sortByKey = <T>(
  data: T[],
  key: keyof T,
  sortOrder: SortDirection
) => {
  const sortAsc = sortOrder === 'asc';

  return data.slice().sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA === valueB) {
      return 0;
    }

    if (valueA === undefined || valueA === null) {
      return sortAsc ? -1 : 1;
    }

    if (valueB === undefined || valueB === null) {
      return sortAsc ? 1 : -1;
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortAsc ? valueA - valueB : valueB - valueA;
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortAsc
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return 0;
  });
};
