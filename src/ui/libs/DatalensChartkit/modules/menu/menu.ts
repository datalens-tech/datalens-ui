import {stringify} from 'querystring';

import {i18n} from 'i18n';
import {isObject} from 'lodash';
import {MenuItemsIds} from 'shared';
import type {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import {getRouter, toSearchParams} from 'ui/navigation';
import {registry} from 'ui/registry';
import type {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import {getChartkitMenuItems} from '../../menu/Menu';

export const getChartkitMenuByType = (props?: GetChartkitMenuByType) => {
    const {
        type,
        config,
        customOptions,
        chartsDataProvider: dataProvider,
        onExportLoading,
        onFullscreenClick,
        isEditAvaible,
        extraOptions,
    } = props || {};

    const chartsDataProvider = dataProvider as ChartKitDataProvider;

    const isEditVisible = isEditAvaible === undefined ? {} : {isVisible: () => isEditAvaible};

    return getChartkitMenuItems({
        type,
        config,
        chartsDataProvider,
        extraOptions,
        customOptions: {
            [MenuItemsIds.NEW_WINDOW]: {
                title: i18n('dash.chartkit-menu.view', 'button_new-tab'),
                action: ({propsData: {id, params}}) => {
                    getRouter().openTab({
                        pathname: `/preview/${id}`,
                        search: stringify(params),
                    });
                },
            },
            [MenuItemsIds.OPEN_AS_TABLE]: {
                action: ({propsData: {id, params}}) => {
                    const resultParams = isObject(params) ? {...params} : {};

                    getRouter().openTab({
                        pathname: `/preview/${id}`,
                        search: toSearchParams({...resultParams, _chart_type: 'table'}),
                    });
                },
            },
            [MenuItemsIds.EDIT]: {
                title: i18n('dash.chartkit-menu.view', 'button_edit'),
                ...isEditVisible,
            },
            [MenuItemsIds.EXPORT]: {
                onExportLoading,
            },
            [MenuItemsIds.FULLSCREEEN]: {
                onFullscreenClick,
            },
            ...customOptions,
        } as GetChartkitMenuByType['customOptions'],
    });
};

/**
 * do not redeclare menu items, use menu type instead
 * @param props
 */
export const getChartkitMenu = (props?: GetChartkitMenuByType) => {
    const getChartkitMenuByType = registry.chart.functions.get('getChartkitMenuByType');
    return getChartkitMenuByType(props);
};
