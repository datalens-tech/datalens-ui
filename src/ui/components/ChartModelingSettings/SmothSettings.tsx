import React from 'react';

import {NumberInput, SegmentedRadioGroup, Select, Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ChartStateSettings, SmoothingLineSettings} from 'shared';
import {DEFAULT_SMOOTHING} from 'shared/constants/chart-modeling';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';

import {RangeInputPicker} from '../common/RangeInputPicker';

import {COLOR_MODE_SELECT_OPTION, SHAPE_SELECT_OPTION, SMOOTHING_SELECT_OPTION} from './constants';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

type Props = {
    widgetId: string;
    chartState: ChartStateSettings | undefined;
};

export const SmothSettings = (props: Props) => {
    const {widgetId, chartState = {}} = props;
    const dispatch = useDispatch();

    const enabled = chartState.smoothing?.enabled ?? false;
    const windowSize = chartState.smoothing?.settings?.windowSize ?? DEFAULT_SMOOTHING.windowSize;
    const colorMode = chartState.smoothing?.settings?.colorMode ?? DEFAULT_SMOOTHING.colorMode;

    const handleEnableSmoothing = React.useCallback(() => {
        dispatch(
            chartModelingActions.updateChartSettings({
                id: widgetId,
                settings: {
                    smoothing: {enabled: !enabled},
                },
            }),
        );
    }, [dispatch, enabled, widgetId]);

    const updateSettings = React.useCallback(
        (updates: Partial<SmoothingLineSettings>) => {
            dispatch(
                chartModelingActions.updateChartSettings({
                    id: widgetId,
                    settings: {
                        smoothing: {
                            ...chartState.smoothing,
                            settings: {
                                ...chartState.smoothing?.settings,
                                ...updates,
                            },
                        },
                    },
                }),
            );
        },
        [chartState.smoothing, dispatch, widgetId],
    );

    const handleChangeWindowSize = React.useCallback(
        (value: number) => {
            updateSettings({windowSize: value});
        },
        [updateSettings],
    );

    const handleUpdateMethod = React.useCallback(() => {}, []);

    const handleUpdateColorMode = React.useCallback(
        (value: string) => {
            updateSettings({colorMode: value as SmoothingLineSettings['colorMode']});
        },
        [updateSettings],
    );

    const handleUpdateShape = React.useCallback(() => {}, []);

    const handleUpdateLineWidth = React.useCallback(() => {}, []);

    return (
        <React.Fragment>
            <div className={b('section-header')}>
                <Text>{i18n('label_smoothing')}</Text>
                <Switch onChange={handleEnableSmoothing} size="l" checked={enabled}></Switch>
            </div>
            {enabled && (
                <React.Fragment>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_method')}</Text>
                        <Select value={['sma']} onUpdate={handleUpdateMethod}>
                            {SMOOTHING_SELECT_OPTION.map((item) => (
                                <Select.Option key={item.value} value={item.value}>
                                    {item.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_window-size')}</Text>
                        <RangeInputPicker
                            size="s"
                            value={windowSize}
                            minValue={2}
                            maxValue={100}
                            step={1}
                            onUpdate={handleChangeWindowSize}
                        />
                    </div>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_color')}</Text>
                        <SegmentedRadioGroup
                            defaultValue={colorMode}
                            onUpdate={handleUpdateColorMode}
                        >
                            {COLOR_MODE_SELECT_OPTION.map((item) => (
                                <SegmentedRadioGroup.Option key={item.value} value={item.value}>
                                    {item.label}
                                </SegmentedRadioGroup.Option>
                            ))}
                        </SegmentedRadioGroup>
                    </div>
                    <div className={b('form-row')}>
                        <Text>{i18n('label_shape-and-width')}</Text>
                        <div className={b('shape-and-width-controls')}>
                            <Select value={['auto']} onUpdate={handleUpdateShape}>
                                {SHAPE_SELECT_OPTION.map((item) => (
                                    <Select.Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Select.Option>
                                ))}
                            </Select>
                            <NumberInput
                                className={b('line-width-input')}
                                onChange={handleUpdateLineWidth}
                            />
                        </div>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
