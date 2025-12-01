import z from 'zod';

import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';

const deleteWizardChartArgsSchema = z.strictObject({
    chartId: z.string(),
});

const deleteWizardChartResultSchema = z.object({});

export const deleteWizardChart = createTypedAction(
    {
        paramsSchema: deleteWizardChartArgsSchema,
        resultSchema: deleteWizardChartResultSchema,
    },
    async (api, {chartId}): Promise<any> => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
            scope: EntryScope.Widget,
            types: ENTRY_TYPES.wizard,
        });

        return {};
    },
);
