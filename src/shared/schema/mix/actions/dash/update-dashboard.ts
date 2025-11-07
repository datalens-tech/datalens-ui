import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {updateDashArgsSchema, updateDashResultSchema} from '../../schemas/dash';
import type {UpdateDashResponse} from '../../types';

export const updateDashboard = createTypedAction(
    {
        paramsSchema: updateDashArgsSchema,
        resultSchema: updateDashResultSchema,
    },
    async (_, args, {headers, ctx}) => {
        const {entryId} = args;

        const I18n = ctx.get('i18n');

        return (await Dash.update(entryId, args, headers, ctx, I18n, {
            forceMigrate: true,
        })) as unknown as UpdateDashResponse;
    },
);
