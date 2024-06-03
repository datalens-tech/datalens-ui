import path from 'path';

import type {Script} from '@gravity-ui/app-layout';
import _ from 'lodash';

import {I18N_DEST_PATH} from '../../i18n/constants';
import {readKeysets} from '../../i18n/read-keysets';
import type {Keysets, ServerI18n, TypedI18n} from '../../i18n/types';
import {initI18n} from '../../i18n/utils';
import {Language} from '../../shared/constants';

export type KeysetData = {content: Keysets; filename: string};
export type KeysetFile = Record<string, KeysetData>;

export const keysetsByLang = _.memoize(() =>
    Object.entries(readKeysets(I18N_DEST_PATH)).reduce((acc, [key, keyset]) => {
        // eslint-disable-next-line security/detect-non-literal-require, global-require
        const content = require(path.resolve(I18N_DEST_PATH, keyset.filename));
        acc[key] = {
            filename: keyset.filename,
            content,
        };

        return acc;
    }, {} as KeysetFile),
);

export function addTranslationsScript({
    publicPath = '/build/',
    allowLanguages = [],
    lang,
    region,
}: {
    publicPath?: string;
    allowLanguages?: string[];
    lang: string;
    region?: string;
}): Script {
    const allowedLang = allowLanguages.includes(lang) ? lang : allowLanguages[0];
    const fileKey = region ? `${allowedLang}-${region}` : `${allowedLang}`;

    const keysetFile = keysetsByLang()[fileKey] as KeysetData | undefined;

    return {
        src: keysetFile ? `${publicPath}i18n/${keysetFile.filename}` : '',
        defer: true,
        crossOrigin: 'anonymous',
    };
}

export function getLang({
    lang,
    defaultLang = Language.En,
    allowLanguages = [],
    hostname = '',
}: {
    lang?: string;
    defaultLang?: string;
    allowLanguages?: string[];
    hostname?: string;
} = {}) {
    const isAllowed = allowLanguages.includes(lang || '');

    if (!isAllowed && /\.(ru)|(com)$/.test(hostname)) {
        const tldLang = hostname.endsWith('.com') ? Language.En : Language.Ru;
        if (allowLanguages.includes(tldLang)) {
            return tldLang;
        }
    }

    if (!isAllowed || !lang) {
        return defaultLang;
    }

    return lang;
}

const i18nInstanceByLang: Record<string, TypedI18n> = {};

export const createI18nInstance = (
    // in some cases we need mutate lang value for i18n.
    // for example, we first set i18n in before-auth-default middleware
    // but later the lang can be changed in other middlewares
    langSettings: {lang: string},
): ServerI18n => {
    return {
        get lang(): string {
            return langSettings.lang;
        },
        getI18nServer() {
            if (this.lang && !i18nInstanceByLang[this.lang]) {
                const data = keysetsByLang()[this.lang] || {content: {}};

                const {I18n: i18nServer} = initI18n({lang: this.lang, content: data.content});
                i18nInstanceByLang[this.lang] = i18nServer;
            }
            return i18nInstanceByLang[this.lang];
        },

        keyset(keysetName: keyof Keysets) {
            return this.getI18nServer().keyset(keysetName);
        },
    };
};
