import type {TempImportExportDataType} from 'ui/components/CollectionsStructure/components/EntriesNotificationCut/types';
import type {ImportExportStatus} from 'ui/components/CollectionsStructure/types';

export const getStatusFromOperation = ({
    progessOperation,
    initialOperation,
}: {
    progessOperation: {
        error: Error | null;
        data: TempImportExportDataType | null;
        isLoading: boolean;
    };
    initialOperation: {
        error: Error | null;
        isLoading: boolean;
    };
}): ImportExportStatus => {
    if (progessOperation.data?.progress && progessOperation.data.progress < 100) {
        return 'pending';
    }
    if (initialOperation.isLoading || progessOperation.isLoading) {
        return 'loading';
    }
    if (progessOperation.data?.status === 'success') {
        return 'success';
    }
    if (
        progessOperation.data?.status === 'error' &&
        progessOperation.data.notifications?.some((item) => item.level === 'critical')
    ) {
        return 'notification-error';
    }
    if (initialOperation.error || progessOperation.error) {
        return 'fatal-error';
    }
    return null;
};
