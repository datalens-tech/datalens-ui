import type {EntryScope} from 'shared';
import type {NotificationLevel} from 'shared/types/meta-manager';

export type PreparedNotificationType = {
    code: string;
    message?: string;
    level: NotificationLevel;
    entries: {
        entryId: string;
        scope: EntryScope;
    }[];
    entryId?: string;
};
