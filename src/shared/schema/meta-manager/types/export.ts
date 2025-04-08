import type {EntryNotification, ProcessStatus} from '../../../types/meta-manager';

export type StartWorkbookExportArgs = {
    workbookId: string;
};

export type StartWorkbookExportResponse = {
    exportId: string;
};

export type GetWorkbookExportStatusArgs = {
    exportId: string;
};

export type GetWorkbookExportStatusResponse = {
    exportId: string;
    status: ProcessStatus;
    progress: number;
    notifications: EntryNotification[] | null;
};

export type GetWorkbookExportResultArgs = {
    exportId: string;
};

export type GetWorkbookExportResultResponse = {
    exportId: string;
    data: Record<string, unknown>;
    status: ProcessStatus;
};

export type CancelWorkbookExportArgs = {
    exportId: string;
};

export type CancelWorkbookExportResponse = {
    exportId: string;
};
