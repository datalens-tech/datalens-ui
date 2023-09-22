import React from 'react';

import {Globe, Palette} from '@gravity-ui/icons';
import {Settings as SettingsComponent} from '@gravity-ui/navigation';
import {getThemeType} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {SYSTEM_THEME} from 'ui/constants';
import {setTheme, updateUserSettings} from 'ui/store/actions/user';
import {selectTheme, selectThemeSettings} from 'ui/store/selectors/user';

import {HighcontrastSettings} from './Appearance/HighcontrastSettings';
import {ThemeSettings} from './Appearance/ThemeSettings';
import {LanguageSettings} from './LanguageSettings';
import {HighcontrastValue} from './types';
import {getThemeUpdates, isHcEnabled} from './utils';

const i18n = I18n.keyset('component.aside-header-settings.view');

export const Settings = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector(selectTheme);
    const themeSettings = useSelector(selectThemeSettings);

    const currentThemeType = getThemeType(currentTheme);
    const currentHcEnabled = isHcEnabled(themeSettings);

    const currentHcValue = currentHcEnabled ? HighcontrastValue.hc : HighcontrastValue.normal;
    const currentThemeValue = currentTheme === SYSTEM_THEME ? currentTheme : currentThemeType;

    const onThemeTypeChange = React.useCallback(
        (updatedTheme: string) => {
            const updates = getThemeUpdates(updatedTheme, updatedTheme, currentHcEnabled);
            dispatch(setTheme(updates));
            dispatch(updateUserSettings({newSettings: {...updates}}));
        },
        [currentHcEnabled, dispatch],
    );

    const onHcStatusChange = React.useCallback(
        (updatedHc: string) => {
            const hcEnabled = updatedHc === HighcontrastValue.hc;
            const updates = getThemeUpdates(currentTheme, currentThemeType, hcEnabled);
            dispatch(setTheme(updates));
            dispatch(updateUserSettings({newSettings: {...updates}}));
        },
        [currentThemeType, currentTheme, dispatch],
    );

    return (
        <SettingsComponent
            title={i18n('label_title')}
            filterPlaceholder={i18n('label_placeholder-search')}
            emptyPlaceholder={i18n('label_not-found')}
        >
            <SettingsComponent.Page
                id="appearance-page"
                title={i18n('section_appearance')}
                icon={{data: Palette}}
            >
                <SettingsComponent.Section title={i18n('section_appearance')}>
                    <SettingsComponent.Item title={i18n('field_interface-theme')} align="top">
                        <ThemeSettings value={currentThemeValue} onUpdate={onThemeTypeChange} />
                    </SettingsComponent.Item>
                    <SettingsComponent.Item
                        title={i18n('field_interface-theme-contrast')}
                        align="top"
                    >
                        <HighcontrastSettings value={currentHcValue} onUpdate={onHcStatusChange} />
                    </SettingsComponent.Item>
                </SettingsComponent.Section>
            </SettingsComponent.Page>
            <SettingsComponent.Page
                id="region-page"
                title={i18n('section_language')}
                icon={{data: Globe}}
            >
                <SettingsComponent.Section title={i18n('section_language')}>
                    <SettingsComponent.Item title={i18n('field_language')} align="top">
                        <LanguageSettings />
                    </SettingsComponent.Item>
                </SettingsComponent.Section>
            </SettingsComponent.Page>
        </SettingsComponent>
    );
};
