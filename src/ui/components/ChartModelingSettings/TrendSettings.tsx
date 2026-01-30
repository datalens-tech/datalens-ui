import React from 'react';

import {Select, Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ChartStateSettings, TrendLineSettings} from 'shared';
import {DEFAULT_TREND_SETTINGS} from 'shared/constants/chart-modeling';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';

import {TREND_SELECT_OPTION} from './constants';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

type Props = {
    widgetId: string;
    chartState: ChartStateSettings | undefined;
};

export const TrendSettings = (props: Props) => {
    const {widgetId, chartState = {}} = props;
    const dispatch = useDispatch();

    const enabled = chartState.trends?.enabled ?? false;
    const method = String(chartState.trends?.settings?.method ?? DEFAULT_TREND_SETTINGS.method);

    const handleEnableTrends = React.useCallback(() => {
        dispatch(
            chartModelingActions.updateChartSettings({
                id: widgetId,
                settings: {
                    trends: {enabled: !enabled},
                },
            }),
        );
    }, [dispatch, enabled, widgetId]);

    const updateSettings = React.useCallback(
        (updates: Partial<TrendLineSettings>) => {
            dispatch(
                chartModelingActions.updateChartSettings({
                    id: widgetId,
                    settings: {
                        trends: {
                            ...chartState.trends,
                            settings: {
                                ...chartState.trends?.settings,
                                ...updates,
                            },
                        },
                    },
                }),
            );
        },
        [chartState.trends, dispatch, widgetId],
    );

    const handleUpdateMethod = React.useCallback(
        (value: string[]) => {
            updateSettings({method: value[0] as TrendLineSettings['method']});
        },
        [updateSettings],
    );

    return (
        <React.Fragment>
            <div className={b('section-header')}>
                <Text>{i18n('label_trend')}</Text>
                <Switch onChange={handleEnableTrends} size="l" checked={enabled}></Switch>
            </div>
            {enabled && (
                <React.Fragment>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_method')}</Text>
                        <Select value={[method]} onUpdate={handleUpdateMethod}>
                            {TREND_SELECT_OPTION.map((item) => (
                                <Select.Option key={item.value} value={item.value}>
                                    {item.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
