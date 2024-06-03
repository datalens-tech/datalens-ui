import type {DataLensApiError} from '../../../../typings';
import type {ConnectionsReduxState} from '../../store';
import type {ErrorScope} from '../ErrorView/ErrorView';

type UseErrorsProps = {
    apiErrors: ConnectionsReduxState['apiErrors'];
};

export const useApiErrors = ({apiErrors}: UseErrorsProps) => {
    const {connectors, connection, entry, schema} = apiErrors;
    let error: DataLensApiError | undefined;
    let scope: ErrorScope | undefined;

    if (connection || entry) {
        error = connection || entry;
        scope = 'connection';
    }

    if (connectors) {
        error = connectors;
        scope = 'connectors';
    }

    if (schema) {
        error = schema;
        scope = 'schema';
    }

    return {error, scope};
};
