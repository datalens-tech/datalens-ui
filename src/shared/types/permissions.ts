import type z from 'zod';

import type {permissionsSchema} from '../zod-schemas/permissions';

export type Permissions = z.infer<typeof permissionsSchema>;
