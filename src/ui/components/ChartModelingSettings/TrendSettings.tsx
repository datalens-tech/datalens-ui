import React from 'react';

import {Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ChartStateSettings} from 'shared';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

type Props = {
    chartState: ChartStateSettings | undefined;
};

export const TrendSettings = (props: Props) => {
    const {chartState: _} = props;

    const handleEnableTrends = React.useCallback(() => {}, []);

    return (
        <React.Fragment>
            <div className={b('section-header')}>
                <Text>{i18n('label_trend')}</Text>
                <Switch onChange={handleEnableTrends} size="l" checked></Switch>
            </div>
        </React.Fragment>
    );
};
