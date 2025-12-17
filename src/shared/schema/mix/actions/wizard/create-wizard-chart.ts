import type {Request, Response} from '@gravity-ui/expresskit';
import z from 'zod';

import type {ChartsEngine} from '../../../../../server/components/charts-engine';
import {keyOrWorkbookIdNameSchema} from '../../../../zod-schemas/entry';
import {createTypedAction} from '../../../gateway-utils';

const paramsSchema = z
    .looseObject({
        template: z.literal('datalens'),
        annotation: z
            .object({
                description: z.string(),
            })
            .optional(),
        data: z.looseObject({}),
    })
    .and(keyOrWorkbookIdNameSchema);

export const __createWizardChart__ = createTypedAction(
    {
        paramsSchema,
        resultSchema: z.looseObject({}),
    },
    async (_, args): Promise<{}> => {
        const req = args.req as Request;
        const res = args.res as Response;
        const chartsEngine = args.chartsEngine as ChartsEngine;

        await chartsEngine.controllers.charts.create(req, res);

        return {};
    },
);
