import {DataLensApiError} from 'ui/typings';

export type ReportButtonProps = {
    error: DataLensApiError;
    requestId: string;
    message: string;
    errorWithoutDocumentation?: string;
    className?: string;
};
