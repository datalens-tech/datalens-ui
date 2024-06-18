import {ErrorCode} from 'shared/constants';
import Utils from 'ui/utils';

import type {DataLensApiError} from '../../../../typings';
import type {ConnectionsReduxState} from '../../store';
import type {ErrorScope} from '../ErrorView/ErrorView';

type UseErrorsProps = {
    apiErrors: ConnectionsReduxState['apiErrors'];
};

type ScopedErrorDetail = 'platform-permission-required';

export const useApiErrors = ({apiErrors}: UseErrorsProps) => {
    const {connectors, connection, entry, schema} = apiErrors;
    const details: ScopedErrorDetail[] = [];
    let error: DataLensApiError | undefined;
    let scope: ErrorScope | undefined;

    if (connection || entry) {
        error = (connection || entry) as DataLensApiError;
        const {code} = Utils.parseErrorResponse(error);
        if (code === ErrorCode.PlatformPermissionRequired) {
            details.push('platform-permission-required');
        }
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

    return {error, scope, details};
};
