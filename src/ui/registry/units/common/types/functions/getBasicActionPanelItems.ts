import type {ActionPanelItem} from '@gravity-ui/dashkit';
import type {DLUserSettings} from 'shared/types';

export type GetBasicActionPanelItems = ({
    scope,
    userSettings,
}: {
    scope?: string;
    userSettings?: DLUserSettings;
}) => ActionPanelItem[];
