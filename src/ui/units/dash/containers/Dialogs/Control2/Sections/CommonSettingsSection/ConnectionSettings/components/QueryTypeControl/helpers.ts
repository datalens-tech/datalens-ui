import type {ConnectionQueryType} from 'shared';

export const prepareQueryTypeSelectorOptions = (connectionQueryTypes: ConnectionQueryType[]) => {
    return connectionQueryTypes.map((qt) => {
        return {
            value: qt.query_type,
            content: qt.query_type_label,
        };
    });
};
