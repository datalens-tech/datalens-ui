import type {Request, Response} from '@gravity-ui/expresskit';
import z from 'zod';

import type {ChartsEngine} from '../../../../../server/components/charts-engine';
import {createTypedAction} from '../../../gateway-utils';

const paramsSchema = z
    .looseObject({
        template: z.literal('ql'),
        annotation: z
            .object({
                description: z.string(),
            })
            .optional(),
        data: z.looseObject({}),
        key: z.string().optional(),
        workbookId: z.string().optional(),
        name: z.string().optional(),
    })
    .refine(
        (data) => {
            const {key, workbookId, name} = data;

            const isKeyProvided = typeof key !== 'undefined';
            const isWorkbookIdProvided = typeof workbookId !== 'undefined';
            const isNameProvided = typeof name !== 'undefined';

            if (isKeyProvided && !isWorkbookIdProvided && !isNameProvided) {
                return true;
            }

            if (!isKeyProvided && isWorkbookIdProvided && isNameProvided) {
                return true;
            }

            return false;
        },
        {
            message:
                "For folder entries provide only 'key', for workbook entries provide only 'workbookId' and 'name' together.",
        },
    );

export const __createQLChart__ = createTypedAction(
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
