import type {ConnectionQueryTypeOptions} from 'shared';

export const prepareQueryTypeSelectorOptions = (
    connectionQueryTypes: ConnectionQueryTypeOptions[],
) => {
    return connectionQueryTypes.map((qt) => {
        return {
            value: qt.query_type,
            content: qt.query_type_label,
        };
    });
};
