export type GetImportStatusArgs = {
    importId: string;
};

export type GetImportStatusResponse = {
    importId: string;
    status: 'pending' | 'success' | 'error';
    progress: number;
};
