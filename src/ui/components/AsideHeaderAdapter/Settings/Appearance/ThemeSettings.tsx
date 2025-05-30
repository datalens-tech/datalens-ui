import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {DARK_THEME, LIGHT_THEME, SYSTEM_THEME} from 'shared';
const i18n = I18n.keyset('component.aside-header-settings.view');

type ThemeSettingsProps = {
    value: string;
    onUpdate: (updatedTheme: string) => void;
};

export const ThemeSettings = ({value, onUpdate}: ThemeSettingsProps) => {
    return (
        <RadioButton value={value} onUpdate={onUpdate}>
            <RadioButton.Option value={LIGHT_THEME}>{i18n('value_theme-light')}</RadioButton.Option>
            <RadioButton.Option value={DARK_THEME}>{i18n('value_theme-dark')}</RadioButton.Option>
            <RadioButton.Option value={SYSTEM_THEME}>
                {i18n('value_theme-system')}
            </RadioButton.Option>
        </RadioButton>
    );
};
