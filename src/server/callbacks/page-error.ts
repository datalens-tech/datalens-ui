import type {Request} from '@gravity-ui/expresskit';

import type {LandingLayoutPageError} from '../../shared';
import {ErrorContentTypes} from '../../shared';

export const getError = (req: Request): Record<string, LandingLayoutPageError> => {
    const {ctx} = req;

    const serviceName = ctx.config.serviceName;

    const I18n = req.ctx.get('i18n');

    const i18n = I18n.keyset('datalens.landing.error');

    return {
        onFail: {
            errorType: ErrorContentTypes.ERROR,
            title: i18n('label_title-fail'),
            description: i18n('label_description-fail'),
            pageTitle: `${i18n('label_page-title-fail')} – ${serviceName}`,
        },
        onMissingEntry: {
            errorType: ErrorContentTypes.NOT_FOUND,
            title: i18n('label_title-missing-entry'),
            pageTitle: `${i18n('label_page-title-missing-entry')} – ${serviceName}`,
        },
    };
};
