import type {CommonSharedExtraSettings} from 'shared';
import {Feature} from 'shared';

import Utils from '../../../utils';

const getDefaultQlAutoExecuteChartValue = () => {
    return Utils.isEnabledFeature(Feature.QlAutoExecuteMonitoringChart) ? 'on' : 'off';
};

export const getQlAutoExecuteChartValue = (
    setting: CommonSharedExtraSettings['qlAutoExecuteChart'],
): 'on' | 'off' => {
    return setting ?? getDefaultQlAutoExecuteChartValue();
};
