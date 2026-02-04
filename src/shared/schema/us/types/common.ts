export interface EntriesFilters {
    name?: string;
}

export interface EntriesOrderBy {
    field: 'createdAt' | 'name';
    direction: 'desc' | 'asc';
}

export interface EntriesCommonArgs {
    filters?: EntriesFilters;
    orderBy?: EntriesOrderBy;
    createdBy?: string | string[];
    page?: number;
    pageSize?: number;
    includePermissionsInfo?: boolean;
    ignoreWorkbookEntries?: boolean;
}
