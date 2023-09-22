import React from 'react';

import {NestedPartial, TableFieldBackgroundSettings} from 'shared';

type UseBackgroundSettingsSwitchArgs = {
    onUpdate: (args: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
};

type UseBackgroundSettingsSwitch = {
    handleSwitchUpdate: (enabled: boolean) => void;
};

export const useBackgroundSettingsSwitch = ({
    onUpdate,
}: UseBackgroundSettingsSwitchArgs): UseBackgroundSettingsSwitch => {
    const handleSwitchUpdate = React.useCallback(
        (enabled: boolean) => {
            onUpdate({enabled});
        },
        [onUpdate],
    );

    return {handleSwitchUpdate};
};
