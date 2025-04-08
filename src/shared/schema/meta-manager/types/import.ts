import type {EntryNotification, ProcessStatus} from '../../../types/meta-manager';

export type StartWorkbookImportArgs = {
    data: Record<string, unknown>;
    title: string;
    description?: string;
    collectionId: string | null;
};

export type StartWorkbookImportResponse = {
    importId: string;
    workbookId: string;
};

export type GetWorkbookImportStatusArgs = {
    importId: string;
};

export type GetWorkbookImportStatusResponse = {
    importId: string;
    workbookId: string;
    status: ProcessStatus;
    progress: number;
    notifications: EntryNotification[] | null;
};

export type CancelWorkbookImportArgs = {
    importId: string;
};

export type CancelWorkbookImportResponse = {
    importId: string;
};
