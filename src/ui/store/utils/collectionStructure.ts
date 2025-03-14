export const getStatusFromOperationData = ({
    isLoading,
    data,
    error,
}: {
    isLoading: boolean;
    // TODO: use type of data from request
    data: {notifications: {level: 'info' | 'warning' | 'critical'}[]} | null;
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
