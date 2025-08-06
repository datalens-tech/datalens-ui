import type {
    GetWorkbookExportStatusResponse,
    GetWorkbookImportStatusResponse,
} from 'shared/schema/meta-manager/types';

import type {ImportExportStatus} from 'ui/components/CollectionsStructure/types';

export const getStatusFromOperation = ({
    progessOperation,
    initialOperation,
}: {
    progessOperation: {
        error: Error | null;
        data: GetWorkbookExportStatusResponse | GetWorkbookImportStatusResponse | null;
        isLoading: boolean;
    };
    initialOperation?: {
        error: Error | null;
        isLoading: boolean;
    };
}): ImportExportStatus => {
    if (
        progessOperation.data?.status === 'error' &&
        progessOperation.data?.notifications?.some((item) => item.level === 'critical')
    ) {
        return 'notification-error';
    }
    if (progessOperation.error) {
        return 'fatal-error';
    }
    if (progessOperation.data?.status === 'pending') {
        return 'pending';
    }
    if (initialOperation?.isLoading || progessOperation.isLoading) {
        return 'loading';
    }
    if (progessOperation.data?.status === 'success') {
        return 'success';
    }
    return null;
};

export const convertFileToJSON = (file: File): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
};
