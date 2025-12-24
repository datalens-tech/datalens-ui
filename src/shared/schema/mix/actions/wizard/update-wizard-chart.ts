import type {Request, Response} from '@gravity-ui/expresskit';
import z from 'zod';

import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope, EntryUpdateMode} from '../../../..';
import type {ChartsEngine} from '../../../../../server/components/charts-engine';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';

const paramsSchema = z.looseObject({
    entryId: z.string(),
    template: z.literal('datalens'),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
    mode: z.enum(EntryUpdateMode),
    data: z.looseObject({}),
});

export const __updateWizardChart__ = createTypedAction(
    {
        paramsSchema,
        resultSchema: z.looseObject({}),
    },
    async (api, args): Promise<{}> => {
        const req = args.req as Request;
        const res = args.res as Response;
        const chartsEngine = args.chartsEngine as ChartsEngine;

        const typedApi = getTypedApi(api);

        const savedEntry = await typedApi.us.getEntry({
            entryId: req.body.entryId,
        });

        if (
            savedEntry.scope !== EntryScope.Widget ||
            !ENTRY_TYPES.wizard.includes(savedEntry.type)
        ) {
            throw new ServerError('No entry found', {
                status: 404,
            });
        }

        req.params.entryId = req.body.entryId;

        await chartsEngine.controllers.charts.update(req, res);

        return {};
    },
);
