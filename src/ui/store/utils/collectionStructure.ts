export const getStatusFromOperationData = ({
    isLoading,
    data,
    error,
}: {
    isLoading: boolean;
    data: unknown | null;
    error: Error | null;
}) => {
    if (isLoading) {
        return 'loading';
    }
    if (data) {
        return 'success';
    }
    if (error) {
        return 'error';
    }
    return null;
};
