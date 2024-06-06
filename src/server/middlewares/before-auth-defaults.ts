import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {FALLBACK_LANGUAGES} from '../../shared';
import {createI18nInstance, getLang} from '../utils/language';

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

    // use `lang` from closure `res` object
    // maybe changed after user auth middleware and fill `userSettings`
    const i18n = createI18nInstance(res.locals as {lang: string});

    req.originalContext.set('i18n', i18n);

    next();
}
