import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import {USER_LANGUAGE_PARAM_NAME} from '@gravity-ui/nodekit';

import {createI18nInstance} from '../utils/language';

export default async function (req: Request, res: Response, next: NextFunction) {
    res.locals.userSettings = {};
    res.locals.userSettings.language = req.ctx.get(USER_LANGUAGE_PARAM_NAME);
    res.locals.lang = req.ctx.get(USER_LANGUAGE_PARAM_NAME);

    // use `lang` from closure `res` object
    // maybe changed after user auth middleware and fill `userSettings`
    const i18n = createI18nInstance(res.locals as {lang: string});

    req.originalContext.set('i18n', i18n);

    next();
}
