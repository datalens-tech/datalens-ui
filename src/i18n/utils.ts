import {I18N} from '@gravity-ui/i18n';

import type {Keysets, TypedI18n} from './types';

type LocaleI18n = {lang: string; content?: Keysets};

// ***
// I18N - used to install a new language for an instance
// I18n - factory for creating curried functions based on a keyset
// i18n - a function with a full set of parameters
// ***
export function initI18n(locale: LocaleI18n | LocaleI18n[]) {
    const i18nInstance = new I18N();

    if (Array.isArray(locale)) {
        locale.forEach(({lang, content}) => {
            if (content) {
                i18nInstance.registerKeysets(lang, content as Keysets);
            } else {
                i18nInstance.registerKeyset(lang, 'empty', {});
            }
        });
        if (locale.length > 0) {
            i18nInstance.setLang(locale[0].lang);
        }
    } else {
        if (locale.content) {
            i18nInstance.registerKeysets(locale.lang, locale.content as Keysets);
        } else {
            i18nInstance.registerKeyset(locale.lang, 'empty', {});
        }
        i18nInstance.setLang(locale.lang);
    }

    const i18n = i18nInstance.i18n.bind(i18nInstance) as TypedI18n;
    const i18nFactoryTyped = i18nInstance as unknown as TypedI18n;

    return {I18N: i18nInstance, I18n: i18nFactoryTyped, i18n};
}
