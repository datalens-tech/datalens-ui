import type z from 'zod';

import type {deleteQLChartResultSchema, getQLChartResultSchema} from '../schemas/ql';

export type GetQLChartResult = z.infer<typeof getQLChartResultSchema>;

export type DeleteQLChartResult = z.infer<typeof deleteQLChartResultSchema>;
