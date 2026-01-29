import React from 'react';

import {ChartLine} from '@gravity-ui/icons';
import {i18n} from 'i18n';

import type {ChartStateSettings} from '../../../../shared';
import {MenuItemsIds} from '../../../../shared';
import {Feature} from '../../../../shared/types/feature';
import {DL} from '../../../constants';
import {isEnabledFeature} from '../../../utils/isEnabledFeature';
import ChartKitIcon from '../components/ChartKitIcon/ChartKitIcon';

import type {MenuItemConfig} from './Menu';

export const getChartModelingMenuItem = ({
    chartState,
}: {
    chartState: ChartStateSettings | undefined;
}): MenuItemConfig => {
    const hasTrendsOnChart = chartState?.trends?.enabled ?? false;
    const hasSmoothingLinesOnChart = chartState?.smoothing?.enabled ?? false;

    return {
        id: MenuItemsIds.CHART_MODELING,
        title: i18n('chartkit.menu', 'modeling'),
        icon: <ChartKitIcon data={ChartLine} />,
        isVisible: () => !DL.IS_MOBILE && isEnabledFeature(Feature.ChartModeling),
        items: [
            {
                id: MenuItemsIds.CHART_MODELING_TREND,
                title: hasTrendsOnChart
                    ? i18n('chartkit.menu', 'remove-trend')
                    : i18n('chartkit.menu', 'add-trend'),
                isVisible: () => true,
                action: ({updateChartData}) => {
                    updateChartData({
                        trends: {enabled: !hasTrendsOnChart},
                    });
                },
            },
            {
                id: MenuItemsIds.CHART_MODELING_SMOOTHING,
                title: hasSmoothingLinesOnChart
                    ? i18n('chartkit.menu', 'remove-smoothing')
                    : i18n('chartkit.menu', 'add-smoothing'),
                isVisible: () => true,
                action: ({updateChartData}) => {
                    updateChartData({
                        smoothing: {enabled: !hasSmoothingLinesOnChart},
                    });
                },
            },
        ],
        action: () => {},
    };
};
