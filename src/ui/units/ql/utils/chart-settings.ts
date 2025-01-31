import type {CommonSharedExtraSettings, QLChartType} from 'shared';
import {Feature, isMonitoringOrPrometheusChart} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

const getDefaultQlAutoExecuteChartValue = () => {
    return isEnabledFeature(Feature.QlAutoExecuteMonitoringChart) ? 'on' : 'off';
};

export const getQlAutoExecuteChartValue = (
    setting: CommonSharedExtraSettings['qlAutoExecuteChart'],
    chartType: QLChartType | null | undefined,
): 'on' | 'off' | undefined => {
    if (!isMonitoringOrPrometheusChart(chartType)) {
        return undefined;
    }
    return setting ?? getDefaultQlAutoExecuteChartValue();
};

export const isQlAutoExecuteChartEnabled = (
    setting: CommonSharedExtraSettings['qlAutoExecuteChart'],
    chartType: QLChartType | null | undefined,
) => {
    return getQlAutoExecuteChartValue(setting, chartType) === 'on';
};
