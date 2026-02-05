import React from 'react';

import {ChartLine} from '@gravity-ui/icons';
import {Label, Text} from '@gravity-ui/uikit';
// import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {chartModelingActions} from 'ui/store/chart-modeling/actions';
import {isChartModelingAvailable} from 'ui/utils/chart-modeling';

import type {ChartStateSettings} from '../../../../shared';
import {MenuItemsIds} from '../../../../shared';
import {DL} from '../../../constants';
import ChartKitIcon from '../components/ChartKitIcon/ChartKitIcon';

import type {MenuItemConfig} from './Menu';

const keyset_mock: any = {
    ru: {
        modeling: 'Моделирование',
        'add-trend': 'Добавить тренд',
        'add-smoothing': 'Добавить сглаживание',
        'remove-trend': 'Убрать тренд',
        'remove-smoothing': 'Убрать сглаживание',
        'modeling-settings': 'Настроить',
    },
    en: {
        modeling: 'Modeling',
        'add-trend': 'Add trend',
        'add-smoothing': 'Add smoothing',
        'remove-trend': 'Remove trend',
        'remove-smoothing': 'Remove smoothing',
        'modeling-settings': 'Settings',
    },
};

const i18n = (_keysetFileName: string, keysetName: string) => {
    return keyset_mock[DL.USER_LANG]?.[keysetName];
};

const dispatchAction = (action: any) => {
    return ({onClose}: {onClose: () => void}) => {
        const dispatch = useDispatch();

        React.useEffect(() => {
            dispatch(action);
            onClose();
        }, [dispatch, onClose]);

        return null;
    };
};

export const getChartModelingMenuItem = ({
    chartState,
    widgetName,
}: {
    chartState: ChartStateSettings | undefined;
    widgetName?: string;
}): MenuItemConfig => {
    const hasTrendsOnChart = chartState?.trends?.enabled ?? false;
    const hasSmoothingLinesOnChart = chartState?.smoothing?.enabled ?? false;

    return {
        id: MenuItemsIds.CHART_MODELING,
        title: () => (
            <React.Fragment>
                <Text style={{marginRight: 8}}>{i18n('chartkit.menu', 'modeling')}</Text>
                <Label theme="info" size="xs">
                    Preview
                </Label>
            </React.Fragment>
        ),
        icon: <ChartKitIcon data={ChartLine} />,
        isVisible: ({loadedData}) => {
            return !DL.IS_MOBILE && isChartModelingAvailable({loadedData});
        },
        items: [
            {
                id: MenuItemsIds.CHART_MODELING_TREND,
                title: hasTrendsOnChart
                    ? i18n('chartkit.menu', 'remove-trend')
                    : i18n('chartkit.menu', 'add-trend'),
                isVisible: () => true,
                action: ({requestId}) => {
                    const widgetId = requestId;
                    const chartSettings = {
                        trends: {enabled: !hasTrendsOnChart},
                    };

                    return dispatchAction(
                        chartModelingActions.updateChartSettings({
                            id: widgetId,
                            settings: chartSettings,
                        }),
                    );
                },
            },
            {
                id: MenuItemsIds.CHART_MODELING_SMOOTHING,
                title: hasSmoothingLinesOnChart
                    ? i18n('chartkit.menu', 'remove-smoothing')
                    : i18n('chartkit.menu', 'add-smoothing'),
                isVisible: () => true,
                action: ({requestId}) => {
                    const widgetId = requestId;
                    const chartSettings = {
                        smoothing: {enabled: !hasSmoothingLinesOnChart},
                    };

                    return dispatchAction(
                        chartModelingActions.updateChartSettings({
                            id: widgetId,
                            settings: chartSettings,
                        }),
                    );
                },
            },
            {
                id: MenuItemsIds.CHART_MODELING_SETTINGS,
                title: i18n('chartkit.menu', 'modeling-settings'),
                isVisible: () => true,
                action: ({requestId}) => {
                    // temporary solution - so that the same chart work differently in different dashboard widgets
                    const widgetId = requestId;
                    return dispatchAction(
                        chartModelingActions.openChartModelingDialog({
                            id: widgetId,
                            widgetName,
                        }),
                    );
                },
            },
        ],
        action: () => {},
    };
};
