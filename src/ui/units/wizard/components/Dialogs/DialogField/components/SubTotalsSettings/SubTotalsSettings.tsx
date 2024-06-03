import React from 'react';

import {Switch} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import type {TableSubTotalsSettings} from 'shared';
import {DialogFieldSubTotalsQa} from 'shared';

import {DialogFieldRow} from '../DialogFieldRow/DialogFieldRow';

type SubTotalsSettingsProps = {
    state: TableSubTotalsSettings;
    onUpdate: (settings: TableSubTotalsSettings) => void;
};

export const SubTotalsSettings: React.FC<SubTotalsSettingsProps> = (
    props: SubTotalsSettingsProps,
) => {
    const {state, onUpdate} = props;

    const handleSwitchUpdate = React.useCallback(
        (checked: boolean) => {
            onUpdate({enabled: checked});
        },
        [onUpdate],
    );

    return (
        <DialogFieldRow
            title={i18n('wizard', 'label_sub-totals-switcher')}
            setting={
                <Switch
                    qa={DialogFieldSubTotalsQa.SubTotalsSwitch}
                    checked={state.enabled}
                    onUpdate={handleSwitchUpdate}
                />
            }
        />
    );
};
