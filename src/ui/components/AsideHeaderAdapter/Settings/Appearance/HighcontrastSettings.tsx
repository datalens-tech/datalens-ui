import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {HighcontrastValue} from '../types';

const i18n = I18n.keyset('component.aside-header-settings.view');

type HighcontrastSettingsProps = {
    value: HighcontrastValue;
    onUpdate: (updatedHc: string) => void;
};

export const HighcontrastSettings = ({value, onUpdate}: HighcontrastSettingsProps) => {
    return (
        <RadioButton value={value} onUpdate={onUpdate}>
            <RadioButton.Option value={HighcontrastValue.normal}>
                {i18n('value_theme-contrast-normal')}
            </RadioButton.Option>
            <RadioButton.Option value={HighcontrastValue.hc}>
                {i18n('value_theme-contrast-enhanced')}
            </RadioButton.Option>
        </RadioButton>
    );
};
