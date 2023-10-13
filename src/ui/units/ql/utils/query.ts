import type {QLQuery} from 'shared/types/ql/common';

export const isQLQueryEmpty = (query: string): boolean => {
    return query.trim().length === 0;
};

export const isPromQlQueriesEmpty = (queries: QLQuery[]): boolean => {
    const isQueriesEmpty = queries.length === 0;

    if (isQueriesEmpty) {
        return true;
    }

    return queries.every((q) => isQLQueryEmpty(q.value));
};
