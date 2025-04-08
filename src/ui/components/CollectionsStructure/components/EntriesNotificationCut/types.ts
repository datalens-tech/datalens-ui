import type {EntryScope} from 'shared';
import type {NotificationLevel} from 'shared/types/meta-manager';

// TODO: use type from api request
export type TempImportExportDataType = {
    importId?: string;
    exportId?: string;
    status: 'pending' | 'success' | 'error';
    progress: number;
    notifications?: {
        entryId?: string;
        scope?: 'connection' | 'dataset';
        code: string;
        message: string;
        level: 'warning' | 'info' | 'critical';
    }[];
};

export type PreparedNotificationType = {
    code: string;
    message: string;
    level: NotificationLevel;
    entries: {
        entryId: string;
        scope: EntryScope;
    }[];
    entryId?: string;
};
