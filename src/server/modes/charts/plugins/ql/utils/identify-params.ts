import type {QlExtendedConfig, StringParams} from '../../../../../../shared';
import {QLChartType} from '../../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../../shared/modules/config/ql';
import type {GetTranslationFn} from '../../../../../../shared/types/language';

export function identifyParams(args: {getTranslation: GetTranslationFn; chart: QlExtendedConfig}) {
    const {chart, getTranslation} = args;

    const config = mapQlConfigToLatestVersion(chart, {
        i18n: getTranslation,
    });
    const {chartType, params} = config;

    const availableParams: StringParams = {};

    if (params) {
        params.forEach((param) => {
            if (
                param.type.includes('interval') &&
                typeof param.defaultValue === 'object' &&
                param.defaultValue !== null
            ) {
                const fromName = `${param.name}_from`;
                const toName = `${param.name}_to`;

                availableParams[`${param.name}`] = '';
                availableParams[fromName] = '';
                availableParams[toName] = '';
            } else {
                availableParams[param.name] = String(param.defaultValue) || "";
            }
        });
    }

    if (chartType === QLChartType.Monitoringql) {
        availableParams['interval'] = '';
    }

    return availableParams;
}
