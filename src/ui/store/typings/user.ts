import type {Theme, ThemeSettings} from '@gravity-ui/uikit';
import type {DLUserSettings} from 'shared';
import type {DataLensApiError} from 'typings';

export type UserState = {
    settings: {
        data: DLUserSettings;
        loading: boolean;
        error: DataLensApiError | null;
    };
    theme: Theme;
    themeSettings: ThemeSettings;
};
