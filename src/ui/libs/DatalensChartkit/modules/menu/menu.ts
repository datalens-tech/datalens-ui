import {stringify} from 'querystring';

import {i18n} from 'i18n';
import {isObject} from 'lodash';
import {MenuItemsIds} from 'shared';
import type {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import {registry} from 'ui/registry';
import type {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import {getChartkitMenuItems} from '../../menu/Menu';
import URI from '../uri/uri';
//import Utils from 'ui/utils';

export function isChartkitMenuItemVisible() {
    const wizardNewChartPathnames = ['/wizard/new', '/wizard/', '/wizard'];

    const isNotSavedChart = wizardNewChartPathnames.some((pathname) =>
        window.location.pathname.endsWith(pathname),
    );

    return !isNotSavedChart;
}

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

    /*const isEditVisible = isEditAvaible === undefined ? {} : {isVisible: () => { 
        var decodedString = atob(Utils.getRpcAuthorization());
        return 'manager' == decodedString.split(':')[0];
    }};*/

    return getChartkitMenuItems({
        type,
        config,
        chartsDataProvider,
        extraOptions,
        customOptions: {
            [MenuItemsIds.NEW_WINDOW]: {
                title: i18n('dash.chartkit-menu.view', 'button_new-tab'),
                action: ({propsData: {id, params}}) => {
                    window.open(`/preview/${id}?${stringify(params)}`);
                },
                isVisible: () => type != 'preview'
            },
            [MenuItemsIds.OPEN_AS_TABLE]: {
                action: ({propsData: {id, params}}) => {
                    const resultParams = isObject(params) ? {...params} : {};
                    const uriParams = {...resultParams, _chart_type: 'table'};
                    const query = URI.makeQueryString(uriParams);
                    window.open(`/preview/${id}${query}`);
                },
            },
            [MenuItemsIds.EDIT]: {
                title: i18n('dash.chartkit-menu.view', 'button_edit'),
                action: ({propsData: {id, params}}) => {
                    window.open(`/navigate/${id}?${stringify(params)}`);
                },
                ...isEditVisible,
            },
            [MenuItemsIds.EXPORT]: {
                onExportLoading,
            },
            [MenuItemsIds.FULLSCREEEN]: {
                onFullscreenClick,
            },
            [MenuItemsIds.GET_LINK]: {
                isVisible: () => isEditVisible
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
