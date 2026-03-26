import type z from 'zod';

import type {entryNotificationSchema} from '../schemas/common';

export type EntryNotification = z.infer<typeof entryNotificationSchema>;
