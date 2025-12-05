import type {DeleteDashResult} from '../../..';
import {getTypedApi} from '../../..';
import {EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {deleteDashArgsSchema, deleteDashResultSchema} from '../../schemas/dash/delete-dashboard';

export const deleteDashboard = createTypedAction(
    {
        paramsSchema: deleteDashArgsSchema,
        resultSchema: deleteDashResultSchema,
    },
    async (api, {lockToken, dashboardId}): Promise<DeleteDashResult> => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: dashboardId,
            lockToken,
            scope: EntryScope.Dash,
        });

        return {};
    },
);
