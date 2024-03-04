import {I18n} from 'i18n';
import type {ConnectionData, ConnectionOptions, ConnectionQueryTypeOptions} from 'shared';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const prepareConnectionData = (
    connection: ConnectionData,
): {error?: string; queryTypes: ConnectionQueryTypeOptions[]} => {
    const options = (connection.options || {}) as ConnectionOptions;

    if (!options.allow_typed_query_usage) {
        return {
            // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
            error: i18n('error_unsupported-connection'),
            queryTypes: [],
        };
    }

    const supportedQueryTypes = options.query_types.filter((qt) => qt.allow_selector);

    return {
        error: supportedQueryTypes.length
            ? undefined
            : // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
              i18n('error_unsupported-connection'),
        queryTypes: supportedQueryTypes,
    };
};
