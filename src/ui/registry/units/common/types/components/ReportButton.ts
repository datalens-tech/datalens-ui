import type {ButtonSize, ButtonView} from '@gravity-ui/uikit';
import type {DataLensApiError} from 'ui/typings';

export type ReportButtonProps = {
    error: DataLensApiError;
    requestId: string;
    message: string;
    errorWithoutDocumentation?: string;
    className?: string;
    size?: ButtonSize;
    view?: ButtonView;
};
