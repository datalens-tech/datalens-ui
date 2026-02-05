import React from 'react';

import {NumberInput, Select, Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ChartStateSettings, TrendLineSettings} from 'shared';
import {DEFAULT_TREND_SETTINGS} from 'shared/constants/chart-modeling';
import {MarkdownHelpPopover} from 'ui/components/MarkdownHelpPopover/MarkdownHelpPopover';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';

import {MAX_LINE_WIDTH, TREND_SELECT_OPTION} from '../constants';

import {ShapeSelect} from './ShapeSelect/ShapeSelect';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

type Props = {
    widgetId: string;
    chartState: ChartStateSettings | undefined;
};

export const TrendSettings = (props: Props) => {
    const {widgetId, chartState = {}} = props;
    const settings = chartState.trends?.settings;
    const dispatch = useDispatch();

    const enabled = chartState.trends?.enabled ?? false;
    const method = String(settings?.method ?? DEFAULT_TREND_SETTINGS.method);
    const dashStyle = settings?.dashStyle ?? DEFAULT_TREND_SETTINGS.dashStyle ?? 'auto';
    const lineWidth = settings?.lineWidth ?? DEFAULT_TREND_SETTINGS.lineWidth;

    const handleEnableTrends = React.useCallback(() => {
        dispatch(
            chartModelingActions.updateChartSettings({
                id: widgetId,
                settings: {
                    trends: {...chartState.trends, enabled: !enabled},
                },
            }),
        );
    }, [chartState.trends, dispatch, enabled, widgetId]);

    const updateSettings = React.useCallback(
        (updates: Partial<TrendLineSettings>) => {
            dispatch(
                chartModelingActions.updateChartSettings({
                    id: widgetId,
                    settings: {
                        trends: {
                            ...chartState.trends,
                            settings: {
                                ...settings,
                                ...updates,
                            },
                        },
                    },
                }),
            );
        },
        [chartState.trends, dispatch, settings, widgetId],
    );

    const handleUpdateMethod = React.useCallback(
        (value: string[]) => {
            updateSettings({method: value[0] as TrendLineSettings['method']});
        },
        [updateSettings],
    );

    const handleUpdateShape = React.useCallback(
        (values: string[]) => {
            const value = values[0] === 'auto' ? undefined : values[0];
            updateSettings({dashStyle: value});
        },
        [updateSettings],
    );

    const handleUpdateLineWidth = React.useCallback(
        (value: number | null) => {
            const lineWidthValue =
                value === null ? undefined : Math.max(1, Math.min(MAX_LINE_WIDTH, value));
            updateSettings({lineWidth: lineWidthValue});
        },
        [updateSettings],
    );

    return (
        <React.Fragment>
            <div className={b('section-header')}>
                <Text
                    variant="subheader-1"
                    className={b('control-label')}
                    onClick={handleEnableTrends}
                >
                    {i18n('label_trend')}
                </Text>
                <Switch onChange={handleEnableTrends} size="l" checked={enabled}></Switch>
            </div>
            {enabled && (
                <React.Fragment>
                    <div className={b('form-row')}>
                        <div className={b('label-with-hint')}>
                            <Text>{i18n('label_method')}</Text>
                            <MarkdownHelpPopover markdown={i18n('tooltip_trend-method')} />
                        </div>
                        <Select value={[method]} onUpdate={handleUpdateMethod}>
                            {TREND_SELECT_OPTION.map((item) => (
                                <Select.Option key={item.value} value={item.value}>
                                    {item.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_shape-and-width')}</Text>
                        <div className={b('shape-and-width-controls')}>
                            <ShapeSelect value={dashStyle} onChange={handleUpdateShape} />
                            <NumberInput
                                min={1}
                                max={12}
                                step={1}
                                value={lineWidth}
                                className={b('line-width-input')}
                                onUpdate={handleUpdateLineWidth}
                            />
                        </div>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
