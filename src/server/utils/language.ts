import path from 'path';

import type {Script} from '@gravity-ui/app-layout';
import _ from 'lodash';

import {I18N_DEST_PATH} from '../../i18n/constants';
import {readKeysets} from '../../i18n/read-keysets';
import type {Keysets} from '../../i18n/types';
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
