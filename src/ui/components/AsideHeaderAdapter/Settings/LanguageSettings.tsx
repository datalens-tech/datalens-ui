import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {Language} from 'shared';
import {DL} from 'ui/constants';
import {useRouter} from 'ui/navigation';
import {updateUserSettings} from 'ui/store/actions/user';
import {getCurrentUserSettings} from 'ui/store/utils/user';

import {ItemField} from './ItemField/ItemField';

const i18n = I18n.keyset('component.aside-header-settings.view');

const allowedLanguages = DL.ALLOW_LANGUAGES;
const languageOptions = allowedLanguages.map((item) => ({
    value: String(item),
    content: i18n(`label_language-${item}`),
}));

const isAllowed = (language: unknown): language is Language => {
    return allowedLanguages.includes(language as Language);
};

const getSettings = () => {
    const currentUserSettings = getCurrentUserSettings() || '{}';
    try {
        return JSON.parse(currentUserSettings) as {language?: unknown};
    } catch {
        return {};
    }
};

export function LanguageSettings({isMobile}: {isMobile: boolean}) {
    const dispatch = useDispatch();
    const router = useRouter();
    const settings = getSettings();
    const language = isAllowed(settings.language)
        ? settings.language
        : allowedLanguages[0] ?? DL.USER_LANG;

    return (
        <ItemField
            value={language}
            onUpdate={(selected: string) => {
                if (isAllowed(selected)) {
                    dispatch(updateUserSettings({newSettings: {language: selected}}));
                    router.reload();
                }
            }}
            isMobile={isMobile}
            options={languageOptions}
        />
    );
}
