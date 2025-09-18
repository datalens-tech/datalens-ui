import {createTypedAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import {deleteWizardChartArgsSchema, deleteWizardChartResultSchema} from '../schemas/wizard';

export const wizardActions = {
    // WIP
    __deleteWizardChart__: createTypedAction(
        {
            paramsSchema: deleteWizardChartArgsSchema,
            resultSchema: deleteWizardChartResultSchema,
        },
        async (api, {chartId}) => {
            const typedApi = getTypedApi(api);

            await typedApi.us._deleteUSEntry({
                entryId: chartId,
            });

            return {};
        },
    ),
};
