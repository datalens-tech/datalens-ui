import z from 'zod';

import {ENTRY_TYPES, EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {getTypedApi} from '../../../simple-schema';

import {__getQLChart__} from './get-ql-chart';

const deleteQLChartArgsSchema = z.strictObject({
    chartId: z.string(),
});

const deleteQLChartResultSchema = z.object({});

export const deleteQLChart = createTypedAction(
    {
        paramsSchema: deleteQLChartArgsSchema,
        resultSchema: deleteQLChartResultSchema,
    },
    async (api, {chartId}) => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
            scope: EntryScope.Widget,
            types: ENTRY_TYPES.ql,
        });

        return {};
    },
);
