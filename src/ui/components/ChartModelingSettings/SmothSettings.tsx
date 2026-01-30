import React from 'react';

import {NumberInput, Select, Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ChartStateSettings} from 'shared';

import {COLOR_SELECT_OPTION, SHAPE_SELECT_OPTION, SMOOTHING_SELECT_OPTION} from './constants';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

type Props = {
    chartState: ChartStateSettings | undefined;
};

export const SmothSettings = (props: Props) => {
    const {chartState: _} = props;

    const handleEnableSmoothing = React.useCallback(() => {}, []);

    const handleUpdateMethod = React.useCallback(() => {}, []);

    const handleUpdateColor = React.useCallback(() => {}, []);

    const handleUpdateShape = React.useCallback(() => {}, []);

    const handleUpdateLineWidth = React.useCallback(() => {}, []);

    return (
        <React.Fragment>
            <div className={b('section-header')}>
                <Text>{i18n('label_smoothing')}</Text>
                <Switch onChange={handleEnableSmoothing} size="l" checked></Switch>
            </div>
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
                    <Text>{i18n('label_color')}</Text>
                    <Select value={['auto']} onUpdate={handleUpdateColor}>
                        {COLOR_SELECT_OPTION.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                                {item.label}
                            </Select.Option>
                        ))}
                    </Select>
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
        </React.Fragment>
    );
};
