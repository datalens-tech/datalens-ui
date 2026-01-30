import React from 'react';

import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {ChartLine} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';

import type {ChartStateSettings} from '../../../../shared';
import {MenuItemsIds, WidgetKind} from '../../../../shared';
import {Feature} from '../../../../shared/types/feature';
import {DL} from '../../../constants';
import {isEnabledFeature} from '../../../utils/isEnabledFeature';
import ChartKitIcon from '../components/ChartKitIcon/ChartKitIcon';
import type {GraphWidget} from '../types';

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
        isVisible: ({loadedData}) => {
            if (DL.IS_MOBILE || !isEnabledFeature(Feature.ChartModeling)) {
                return false;
            }

            switch (loadedData.type) {
                case WidgetKind.GravityCharts: {
                    return (loadedData.data as ChartData).series.data.every(
                        (s) => s.type === 'line',
                    );
                }
                case WidgetKind.Graph: {
                    return (loadedData as GraphWidget).libraryConfig.chart?.type === 'line';
                }
                default: {
                    return false;
                }
            }
        },
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
            {
                id: MenuItemsIds.CHART_MODELING_SETTINGS,
                title: i18n('chartkit.menu', 'modeling-settings'),
                isVisible: () => true,
                action: () => {
                    return ({onClose}: {onClose: () => void}) => {
                        const dispatch = useDispatch();

                        React.useEffect(() => {
                            dispatch(chartModelingActions.setOpen(true));
                            onClose();
                        }, [dispatch, onClose]);

                        return null;
                    };
                },
            },
        ],
        action: () => {},
    };
};
