import type z from 'zod';

import type {datalensOperationSchema} from '../schemas/operation';

export type GetDatalensOperationArgs = {
    operationId: string;
};

export type GetDatalensOperationResponse = z.infer<typeof datalensOperationSchema>;
