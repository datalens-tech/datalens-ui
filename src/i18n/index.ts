import {GLOBAL_I18N_VAR} from './constants';
import {initI18n} from './utils';

const isBrowserEnv = typeof window === 'object';
const isJestEnv = typeof jest !== 'undefined';

export const lang =
    // @ts-ignore avoid `window.d.ts` import because of too many ui types relations
    isBrowserEnv ? (window.DL.user.lang as string | undefined) || 'en' : 'en';

let i18nPrepared: ReturnType<typeof initI18n>;
if (isBrowserEnv && !isJestEnv) {
    // @ts-ignore ignore `window` string index
    i18nPrepared = initI18n({lang, content: window[GLOBAL_I18N_VAR] || {}});
} else {
    // empty keysets for jest (mock i18n as needed)
    i18nPrepared = initI18n([{lang: 'ru'}, {lang: 'en'}]);
}

export const I18N = i18nPrepared.I18N;
export const I18n = i18nPrepared.I18n;
export const i18n = i18nPrepared.i18n;
