import type {EntryScope} from './common';

export type ProcessStatus = 'pending' | 'success' | 'error';

export type NotificationLevel = 'info' | 'warning' | 'critical';

export type EntryNotification = {
    entryId?: string;
    scope?: EntryScope;
    code: string;
    message?: string;
    level: NotificationLevel;
};
