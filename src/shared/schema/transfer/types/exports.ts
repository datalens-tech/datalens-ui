export type StartExportArgs = {
    workbookId: string;
};

export type StartExportResponse = {
    exportId: string;
};

export type GetExportStatusArgs = {
    exportId: string;
};

export type GetExportStatusResponse = {
    exportId: string;
    status: 'pending' | 'success' | 'error';
    data: Record<string, unknown>;
};
