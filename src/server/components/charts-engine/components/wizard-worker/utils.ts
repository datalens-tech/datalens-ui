import {getTranslationFn} from '../../../../../shared/modules/language';
import {createI18nInstance} from '../../../../utils/language';
import type {GetChartApiContextArgs} from '../processor/chart-api-context';
import {getChartApiContext as getBaseChartApiContext} from '../processor/chart-api-context';

const DEFAULT_USER_LANG = 'ru';

export function getChartApiContext(args: GetChartApiContextArgs) {
    const context = getBaseChartApiContext(args);

    const i18n = createI18nInstance({lang: args.userLang || DEFAULT_USER_LANG});
    context.ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

    return context;
}
