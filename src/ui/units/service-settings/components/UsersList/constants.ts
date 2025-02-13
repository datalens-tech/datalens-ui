export const BASE_USER_FILTERS = {FILTER_STRING: 'filterString', ROLES: 'roles'};

type BaseFiltersKeys = keyof typeof BASE_USER_FILTERS;
export type BaseFiltersNames = (typeof BASE_USER_FILTERS)[BaseFiltersKeys];
