import type {ActionPanelItem} from '@gravity-ui/dashkit';
import type {DLUserSettings} from 'shared/types';

export type GetBasicActionPanelItems = (params?: {
    scope?: string;
    userSettings?: DLUserSettings;
}) => ActionPanelItem[];
