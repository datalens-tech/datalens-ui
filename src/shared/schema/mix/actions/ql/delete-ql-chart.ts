import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {deleteQLChartArgsSchema, deleteQLChartResultSchema} from '../../schemas/ql';
import type {DeleteQLChartResult} from '../../types';

export const deleteQLChart = createTypedAction(
    {
        paramsSchema: deleteQLChartArgsSchema,
        resultSchema: deleteQLChartResultSchema,
    },
    async (api, {chartId}): Promise<DeleteQLChartResult> => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
            scope: EntryScope.Widget,
            types: ENTRY_TYPES.ql,
        });

        return {};
    },
);
