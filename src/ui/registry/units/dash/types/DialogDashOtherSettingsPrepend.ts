import type {DashSettings} from 'shared';

export type DialogDashOtherSettingsPrependProps = {
    view?: 'dialog' | 'drawer';
    onChange: (settings: Partial<DashSettings>) => void;
    initialSettings: DashSettings;
    settings: Partial<DashSettings>;
};
