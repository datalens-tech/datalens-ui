import type {Request, Response} from '@gravity-ui/expresskit';
import z from 'zod';

import type {ChartsEngine} from '../../../../../server/components/charts-engine';
import {createTypedAction} from '../../../gateway-utils';

export const __updateWizardChart__ = createTypedAction(
    {
        paramsSchema: z.looseObject({}),
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
