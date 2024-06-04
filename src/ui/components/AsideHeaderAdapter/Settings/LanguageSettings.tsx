import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {Language} from 'shared';
import {DL} from 'ui/constants';
import {updateUserSettings} from 'ui/store/actions/user';
import {getCurrentUserSettings} from 'ui/store/utils/user';

import {ItemField} from './ItemField/ItemField';

const i18n = I18n.keyset('component.aside-header-settings.view');

const allowedLanguages = DL.ALLOW_LANGUAGES;
const languageOptions = allowedLanguages.map((item) => ({
    value: String(item),
    content: i18n(`label_language-${item}`),
}));

export function LanguageSettings({isMobile}: {isMobile: boolean}) {
    const dispatch = useDispatch();

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
        <ItemField
            value={lang}
            onUpdate={handleLanguageChange}
            isMobile={isMobile}
            options={languageOptions}
        />
    );
}
