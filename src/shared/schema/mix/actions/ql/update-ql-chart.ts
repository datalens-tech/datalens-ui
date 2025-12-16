import type {Request, Response} from '@gravity-ui/expresskit';
import z from 'zod';

import {EntryUpdateMode} from '../../../..';
import type {ChartsEngine} from '../../../../../server/components/charts-engine';
import {createTypedAction} from '../../../gateway-utils';

const paramsSchema = z.looseObject({
    entryId: z.string(),
    template: z.literal('ql'),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
    mode: z.enum(EntryUpdateMode),
    data: z.looseObject({}),
});

export const __updateQLChart__ = createTypedAction(
    {
        paramsSchema,
        resultSchema: z.looseObject({}),
    },
    async (_, args): Promise<{}> => {
        const req = args.req as Request;
        const res = args.res as Response;
        const chartsEngine = args.chartsEngine as ChartsEngine;

        req.params.entryId = req.body.entryId;

        await chartsEngine.controllers.charts.update(req, res);

        return {};
    },
);
