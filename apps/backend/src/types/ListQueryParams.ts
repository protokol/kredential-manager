export type ListQueryParams = {
    page?: number;
    limit?: number;
    [key: string]: any; // This allows for any number of additional string keys
};
