import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {deleteWizardChartArgsSchema, deleteWizardChartResultSchema} from '../../schemas/wizard';
import type {DeleteWizardResult} from '../../types';

export const deleteWizardChart = createTypedAction(
    {
        paramsSchema: deleteWizardChartArgsSchema,
        resultSchema: deleteWizardChartResultSchema,
    },
    async (api, {chartId}): Promise<DeleteWizardResult> => {
        const typedApi = getTypedApi(api);

        await typedApi.us._deleteUSEntry({
            entryId: chartId,
            scope: EntryScope.Widget,
            types: ENTRY_TYPES.wizard,
        });

        return {};
    },
);
