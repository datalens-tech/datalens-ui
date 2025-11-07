import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {createDashArgsSchema, createDashResultSchema} from '../../schemas/dash';
import type {CreateDashResponse} from '../../types';

export const createDashboard = createTypedAction(
    {
        paramsSchema: createDashArgsSchema,
        resultSchema: createDashResultSchema,
    },
    async (_, args, {headers, ctx}) => {
        const I18n = ctx.get('i18n');

        return (await Dash.create(args, headers, ctx, I18n)) as unknown as CreateDashResponse;
    },
);
