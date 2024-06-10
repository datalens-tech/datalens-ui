import {WizardVisualizationId} from '../../../../constants';
import type {
    V10ChartsConfig,
    V11ChartsConfig,
    V11CommonSharedExtraSettings,
} from '../../../../types';
import {ChartsConfigVersion, IndicatorTitleMode} from '../../../../types';

export const mapV10ConfigToV11 = (config: V10ChartsConfig): V11ChartsConfig => {
    let extraSettings = config.extraSettings as V11CommonSharedExtraSettings;
    if (config.visualization?.id === WizardVisualizationId.Metric) {
        extraSettings = {...config.extraSettings};

        if (extraSettings.titleMode === 'hide') {
            extraSettings.indicatorTitleMode = IndicatorTitleMode.Hide;
        } else if (extraSettings.titleMode === 'show' && extraSettings.title) {
            extraSettings.indicatorTitleMode = IndicatorTitleMode.Manual;
        }

        extraSettings.indicatorTitleMode = IndicatorTitleMode.ByField;
    }

    return {
        ...config,
        extraSettings,
        version: ChartsConfigVersion.V11,
    };
};
