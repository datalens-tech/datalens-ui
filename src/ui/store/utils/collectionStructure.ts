import type {TempImportExportDataType} from 'ui/components/CollectionsStructure/components/EntriesNotificationCut/types';

export const getStatusFromOperationData = ({
    isLoading,
    data,
    error,
}: {
    isLoading: boolean;
    data: TempImportExportDataType | null;
    error: Error | null;
}) => {
    if (isLoading) {
        return 'loading';
    }
    if (data) {
        return data.notifications.length &&
            data.notifications.some((notification) => notification.level === 'critical')
            ? 'notification-error'
            : 'success';
    }
    if (error) {
        return 'fatal-error';
    }
    return null;
};
