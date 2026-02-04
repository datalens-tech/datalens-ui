import type z from 'zod';

import type {deleteWizardChartResultSchema, getWizardChartResultSchema} from '../schemas/wizard';

export type GetWizardResult = z.infer<typeof getWizardChartResultSchema>;

export type DeleteWizardResult = z.infer<typeof deleteWizardChartResultSchema>;
