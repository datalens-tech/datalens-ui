import type {CommonSharedExtraSettings} from 'shared';
import {Feature} from 'shared';

import Utils from '../../../utils';

export const getQlAutoExecuteChartValue = (
    setting: CommonSharedExtraSettings['qlAutoExecuteChart'],
): 'on' | 'off' => {
    return setting ?? Utils.isEnabledFeature(Feature.QlAutoExecuteMonitoringChart) ? 'on' : 'off';
};
