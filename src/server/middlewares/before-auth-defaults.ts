import {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {Keysets, ServerI18n} from '../../i18n/types';
import {initI18n} from '../../i18n/utils';
import {FALLBACK_LANGUAGES} from '../../shared';
import {getLang, keysetsByLang} from '../utils/language';

export default async function (req: Request, res: Response, next: NextFunction) {
    const regionalEnvConfig = req.ctx.config.regionalEnvConfig;
    res.locals.userSettings = {};

    const allowLanguages = regionalEnvConfig?.allowLanguages || FALLBACK_LANGUAGES;
    const langHeader = req.acceptsLanguages(allowLanguages);
    const langQuery = (req.query._lang || '') as string;
    const lang = langQuery || langHeader || '';

    const langResult = getLang({
        lang,
        hostname: req.hostname,
        allowLanguages,
        defaultLang: regionalEnvConfig?.defaultLang,
    });

    res.locals.userSettings.language = langResult;
    res.locals.lang = langResult;

    const i18n: ServerI18n = {
        i18nServer: null,

        // use `lang` from closure `res` object
        // maybe changed after user auth middleware and fill `userSettings`
        get lang(): string {
            return res.locals.lang;
        },

        getI18nServer() {
            if (!this.i18nServer || this.i18nServer.lang !== this.lang) {
                const data = keysetsByLang()[this.lang] || {content: {}};

                const {I18n: i18nServer} = initI18n({lang: this.lang, content: data.content});
                this.i18nServer = i18nServer;
            }
            return this.i18nServer;
        },

        keyset(keysetName: keyof Keysets) {
            return this.getI18nServer().keyset(keysetName);
        },
    };

    req.originalContext.set('i18n', i18n);

    next();
}
