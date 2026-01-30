import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Drawer, DrawerItem} from '@gravity-ui/navigation';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {ChartStateSettings} from 'shared';
import {reducerRegistry} from 'ui/store';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';
import {chartModelingReducer} from 'ui/store/chart-modeling/reducer';
import {selectIsChartModelingSettingOpen} from 'ui/store/chart-modeling/selectors';

import {SmothSettings} from './SmothSettings';
import {TrendSettings} from './TrendSettings';

import './ChartModelingSettings.scss';

reducerRegistry.register({
    chartModeling: chartModelingReducer,
});

type Props = {
    chartState: ChartStateSettings | undefined;
};

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

export const ChartModelingSettings = (props: Props) => {
    const {chartState} = props;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const isOpen = useSelector(selectIsChartModelingSettingOpen);
    const dispatch = useDispatch();

    const handleClose = React.useCallback(() => {
        dispatch(chartModelingActions.setOpen(false));
    }, [dispatch]);

    return (
        <Drawer className={b()} hideVeil={true} keepMounted={true}>
            <DrawerItem
                id="item"
                visible={isOpen}
                direction="right"
                className={b('container')}
                ref={containerRef}
            >
                <div className={b('section')}>
                    <div className={b('header')}>
                        <Text variant="subheader-2">{i18n('title_modeling')}</Text>
                        <Button view="flat" size="m" onClick={handleClose}>
                            <Icon data={Xmark} />
                        </Button>
                    </div>
                </div>
                <div className={b('section')}>
                    <SmothSettings chartState={chartState} />
                </div>
                <div className={b('section')}>
                    <TrendSettings chartState={chartState} />
                </div>
            </DrawerItem>
        </Drawer>
    );
};
