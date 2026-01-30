import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Drawer, DrawerItem} from '@gravity-ui/navigation';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DatalensGlobalState} from 'ui/index';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';
import {getChartModelingState, getEditingWidgetId} from 'ui/store/chart-modeling/selectors';

import {SmothSettings} from './SmothSettings';
import {TrendSettings} from './TrendSettings';

import './ChartModelingSettings.scss';

const b = block('chart-modeling-settings');
const i18n = I18n.keyset('component.chart-modeling-settings');

export const ChartModelingSettings = () => {
    const dispatch = useDispatch();
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const widgetId = useSelector(getEditingWidgetId);
    const isOpen = Boolean(widgetId);
    const chartState = useSelector((state: DatalensGlobalState) =>
        getChartModelingState(state, widgetId),
    );

    const handleClose = React.useCallback(() => {
        dispatch(chartModelingActions.closeChartModelingDialog());
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
                {Boolean(widgetId) && (
                    <React.Fragment>
                        <div className={b('section')}>
                            <SmothSettings chartState={chartState} widgetId={String(widgetId)} />
                        </div>
                        <div className={b('section')}>
                            <TrendSettings chartState={chartState} widgetId={String(widgetId)} />
                        </div>
                    </React.Fragment>
                )}
            </DrawerItem>
        </Drawer>
    );
};
