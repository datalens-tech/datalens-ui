import {Theme, ThemeSettings} from '@gravity-ui/uikit';
import {DLUserSettings} from 'shared';
import {DataLensApiError} from 'typings';

export type UserState = {
    settings: {
        data: DLUserSettings;
        loading: boolean;
        error: DataLensApiError | null;
    };
    theme: Theme;
    themeSettings: ThemeSettings;
};
