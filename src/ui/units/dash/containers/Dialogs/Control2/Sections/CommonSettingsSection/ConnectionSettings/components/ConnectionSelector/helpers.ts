import type {ConnectionData, ConnectionOptions, ConnectionQueryTypeOptions} from 'shared';

const i18nConnectionBasedControlFake = (str: string) => str;

export const prepareConnectionData = (
    connection: ConnectionData,
): {error?: string; queryTypes: ConnectionQueryTypeOptions[]} => {
    const options = (connection.options || {}) as ConnectionOptions;

    if (!options.allow_typed_query_usage) {
        return {
            error: i18nConnectionBasedControlFake('error_unsupported-connection'),
            queryTypes: [],
        };
    }

    const supportedQueryTypes = options.query_types.filter((qt) => qt.allow_selector);

    return {
        error: supportedQueryTypes.length
            ? undefined
            : i18nConnectionBasedControlFake('error_unsupported-connection'),
        queryTypes: supportedQueryTypes,
    };
};
