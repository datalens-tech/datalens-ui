import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Drawer, DrawerItem} from '@gravity-ui/navigation';
import {Button, Icon, Switch, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DatalensGlobalState} from 'ui/index';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';
import {getChartModelingState, getEditingWidgetId} from 'ui/store/chart-modeling/selectors';

import {EntityIcon} from '../EntityIcon/EntityIcon';

import {SmothSettings} from './components/SmothSettings';
import {TrendSettings} from './components/TrendSettings';

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
    const widgetName = chartState?.widgetName;

    const handleClose = React.useCallback(() => {
        dispatch(chartModelingActions.closeChartModelingDialog());
    }, [dispatch]);

    const shouldLinkSeries = Boolean(
        chartState?.smoothing?.settings?.linked || chartState?.trends?.settings?.linked,
    );
    const handleLinkSeries = React.useCallback(() => {
        if (!widgetId) {
            return;
        }

        dispatch(
            chartModelingActions.updateChartSettings({
                id: widgetId,
                settings: {
                    smoothing: {
                        ...chartState.smoothing,
                        settings: {
                            ...chartState.smoothing?.settings,
                            linked: !shouldLinkSeries,
                        },
                    },
                    trends: {
                        ...chartState.trends,
                        settings: {
                            ...chartState.trends?.settings,
                            linked: !shouldLinkSeries,
                        },
                    },
                },
            }),
        );
    }, [chartState, dispatch, shouldLinkSeries, widgetId]);

    React.useEffect(() => {
        return () => {
            dispatch(chartModelingActions.closeChartModelingDialog());
        };
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
                    {widgetName && (
                        <div className={b('widget-name')}>
                            <EntityIcon size="m" type={'chart-wizard'} iconSize={12} />
                            <Text>{widgetName}</Text>
                        </div>
                    )}
                </div>
                {Boolean(widgetId) && (
                    <React.Fragment>
                        <div className={b('section')}>
                            <SmothSettings chartState={chartState} widgetId={String(widgetId)} />
                        </div>
                        <div className={b('section')}>
                            <TrendSettings chartState={chartState} widgetId={String(widgetId)} />
                        </div>
                        <div className={b('section')}>
                            <div className={b('section-header')}>
                                <Text variant="subheader-1">
                                    {i18n('label_additional-settings')}
                                </Text>
                            </div>
                            <div className={b('form-row', {switch: true})}>
                                <Text className={b('control-label')} onClick={handleLinkSeries}>
                                    {i18n('label_link-series')}
                                </Text>
                                <Switch
                                    onChange={handleLinkSeries}
                                    size="l"
                                    checked={shouldLinkSeries}
                                ></Switch>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </DrawerItem>
        </Drawer>
    );
};
