import z from 'zod';

import {ENTRY_TYPES, EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {getTypedApi} from '../../../simple-schema';

const deleteWizardChartArgsSchema = z.strictObject({
    chartId: z.string(),
});

const deleteWizardChartResultSchema = z.object({});

export const deleteWizardChart = createTypedAction(
    {
        paramsSchema: deleteWizardChartArgsSchema,
        resultSchema: deleteWizardChartResultSchema,
    },
    async (api, {chartId}) => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
            scope: EntryScope.Widget,
            types: ENTRY_TYPES.wizard,
        });

        return {};
    },
);
