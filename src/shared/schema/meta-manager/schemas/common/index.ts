import z from 'zod';

import {EntryScope} from '../../../..';
import {NOTIFICATION_LEVEL, PROCESS_STATUS} from '../../../../constants/meta-manager';

export const notificationLevelSchema = z.enum(NOTIFICATION_LEVEL);

export const processStatusSchema = z.enum(PROCESS_STATUS);

export const entryNotificationSchema = z.object({
    entryId: z.string().optional(),
    scope: z.enum(EntryScope).optional(),
    code: z.string(),
    message: z.string().optional(),
    level: notificationLevelSchema,
    details: z.unknown().optional(),
});
