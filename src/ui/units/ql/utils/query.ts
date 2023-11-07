import type {QLConfigQuery} from 'shared/types/config/ql';

export const isQLQueryEmpty = (query: string): boolean => {
    return query.trim().length === 0;
};

export const isPromQlQueriesEmpty = (queries: QLConfigQuery[]): boolean => {
    const isQueriesEmpty = queries.length === 0;

    if (isQueriesEmpty) {
        return true;
    }

    return queries.every((q) => isQLQueryEmpty(q.value));
};
