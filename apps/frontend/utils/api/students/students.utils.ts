export const getSearchFilter = (query: string): string => {
  if (!query) {
    return '';
  }
  return `first_name:like:${query}`;
};
