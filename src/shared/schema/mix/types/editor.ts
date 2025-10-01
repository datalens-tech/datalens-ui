import type z from 'zod/v4';

import type {getEditorChartResultSchema} from '../schemas/editor';

export type GetEditorChartResponse = z.infer<typeof getEditorChartResultSchema>;
