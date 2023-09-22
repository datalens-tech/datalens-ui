import React from 'react';

import {RadioButton} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {Language} from 'shared';
import {DL} from 'ui/constants';
import {updateUserSettings} from 'ui/store/actions/user';
import {getCurrentUserSettings} from 'ui/store/utils/user';

const i18n = I18n.keyset('component.aside-header-settings.view');

export function LanguageSettings() {
    const dispatch = useDispatch();
    const allowedLanguages = DL.ALLOW_LANGUAGES;
    const currentUserSettings = getCurrentUserSettings() || '{}';
    let language = DL.USER_LANG as Language;
    try {
        const preparedSettings = JSON.parse(currentUserSettings);
        language = preparedSettings.language || DL.USER_LANG;
    } catch {
        // no lang in localStorage
    }
    const lang = language && allowedLanguages.includes(language) ? language : allowedLanguages[0];

    function handleLanguageChange(selected: string) {
        dispatch(updateUserSettings({newSettings: {language: selected as Language}}));
        window.location.reload();
    }

    return (
        <RadioButton value={lang} onUpdate={handleLanguageChange}>
            {allowedLanguages.map((item) => (
                <RadioButton.Option value={String(item)} key={`settings-lang-${item}`}>
                    {i18n(`label_language-${item}`)}
                </RadioButton.Option>
            ))}
        </RadioButton>
    );
}
