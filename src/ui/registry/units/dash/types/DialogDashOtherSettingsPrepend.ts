import type {DashSettings} from 'shared';

export type DialogDashOtherSettingsPrependProps = {
    onChange: (settings: Partial<DashSettings>) => void;
    initialSettings: DashSettings;
    settings: Partial<DashSettings>;
};
