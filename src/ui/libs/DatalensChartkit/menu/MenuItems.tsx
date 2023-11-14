import React from 'react';

import type {Highcharts, HighchartsComment} from '@gravity-ui/chartkit/highcharts';
import {
    ArrowShapeTurnUpRight,
    ArrowUpRightFromSquare,
    Code,
    LayoutCells,
    Megaphone,
    Pencil,
} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {I18n, i18n} from 'i18n';
import {Feature, MenuItemsIds} from 'shared';
import {DialogShare} from 'ui/components/DialogShare/DialogShare';
import {URL_OPTIONS as COMMON_URL_OPTIONS} from 'ui/constants';
import {registry} from 'ui/registry';

import {ChartWidgetDataRef} from '../../../components/Widgets/Chart/types';
import Utils from '../../../utils';
import {CHARTKIT_WIDGET_TYPE} from '../ChartKit/components/Widget/Widget';
import {getExportItem} from '../components/ChartKitBase/components/Header/components/Menu/Items/Export/Export';
import Inspector from '../components/ChartKitBase/components/Header/components/Menu/Items/Inspector/Inspector';
import {ChartKitDataProvider} from '../components/ChartKitBase/types';
import ChartKitIcon from '../components/ChartKitIcon/ChartKitIcon';
import {URL_OPTIONS as CHARTKIT_URL_OPTIONS} from '../modules/constants/constants';
import type DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import {LoadedWidget, Widget as TWidget, WidgetData} from '../types';

import type {MenuItemConfig, MenuItemModalProps, MenuLoadedData} from './Menu';

import './MenuItems.scss';

const b = block('dl-chartkit-menu-items');

export const ICONS_MENU_DEFAULT_CLASSNAME = b('icon');
export const ICONS_MENU_DEFAULT_SIZE = 16;

export type MenuItemArgs = {
    loadedData: MenuLoadedData;
    widget: null | TWidget | LoadedWidget;
    widgetDataRef?: ChartWidgetDataRef | null;
    error?: DatalensChartkitCustomError;
    widgetRenderTimeRef?: React.MutableRefObject<number | null>;
};

export type MenuCommentsItemVisibleArgs = {
    loadedData: null | (Omit<MenuLoadedData, 'data'> & {data: {comments?: HighchartsComment[]}});
    widget: null | Highcharts.Chart | LoadedWidget;
    widgetDataRef?: ChartWidgetDataRef | null;
    widgetRenderTimeRef?: React.MutableRefObject<number | null>;
    callbackOnCommentsChanged?: (commentsLength: number) => void;
    updatedCommentsLength?: number | null;
};

export const getExportMenuItem = getExportItem;

export const getInspectorMenuItem: () => MenuItemConfig = Inspector;

const alertI18n = I18n.keyset('component.chartkit-alerts.view');

export const getAlertsMenuItem = ({
    chartsDataProvider,
    customConfig,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}): MenuItemConfig | null => {
    if (!Utils.isEnabledFeature(Feature.ChartkitAlerts)) {
        return null;
    }

    return {
        id: MenuItemsIds.ALERTS,
        get title() {
            return alertI18n('section_title');
        },
        icon: <ChartKitIcon data={Megaphone} className={ICONS_MENU_DEFAULT_CLASSNAME} />,
        isVisible: (params: MenuItemArgs) => {
            if (!params) {
                return false;
            }
            const {loadedData, widget, error} = params;

            const isCriticalError = error && !error?.extra?.rowsExceededLimit;

            if (widget === null || !loadedData || error) {
                return false;
            }
            if (!loadedData.entryId) {
                return false;
            }
            return (
                !isCriticalError &&
                (loadedData.isNewWizard || loadedData.type === CHARTKIT_WIDGET_TYPE.GRAPH)
            );
        },
        action: ({loadedData}: {loadedData: WidgetData}) => {
            const menuAction = (options: {loadedData: WidgetData}) => {
                const {AlertDialog} = registry.chart.components.getAll();

                return (props: MenuItemModalProps) => (
                    <AlertDialog
                        data={options.loadedData}
                        chartsDataProvider={chartsDataProvider}
                        onClose={props.onClose}
                    />
                );
            };

            if (customConfig?.actionWrapper) {
                return customConfig.actionWrapper(menuAction)({loadedData});
            }

            return menuAction({loadedData});
        },
    };
};

export const getNewWindowMenuItem = ({
    chartsDataProvider,
    customConfig,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}): MenuItemConfig => ({
    id: MenuItemsIds.NEW_WINDOW,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'open-in-window');
    },
    icon: customConfig?.icon || (
        <ChartKitIcon data={ArrowUpRightFromSquare} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: () => true,
    action:
        customConfig?.action ||
        (({loadedData, propsData, chartsDataProvider: dataProvider}) => {
            const link = (dataProvider || chartsDataProvider)?.getGoAwayLink(
                {loadedData, propsData},
                {
                    urlPostfix: '/preview',
                    idPrefix: '/editor/',
                    extraParams: {[COMMON_URL_OPTIONS.ACTION_PARAMS_ENABLED]: '1'},
                },
            );

            window.open(link);
        }),
});

export const getEditMenuItem = ({
    chartsDataProvider,
    customConfig,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}): MenuItemConfig => ({
    id: MenuItemsIds.EDIT,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'open-edit');
    },
    icon: customConfig?.icon || (
        <ChartKitIcon data={Pencil} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: () => (customConfig?.isVisible ? customConfig.isVisible() : true),
    action:
        customConfig?.action ||
        (({loadedData = {}, propsData, chartsDataProvider: dataProvider}) => {
            window.open(
                (dataProvider || chartsDataProvider)?.getGoAwayLink(
                    {loadedData, propsData},
                    {idPrefix: '/navigation/'},
                ),
            );
        }),
});

export const getOpenAsTableMenuItem = ({
    chartsDataProvider,
    customConfig,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}): MenuItemConfig => ({
    id: MenuItemsIds.OPEN_AS_TABLE,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'open-as-table');
    },
    icon: customConfig?.icon || (
        <ChartKitIcon data={LayoutCells} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: ({loadedData, error}: MenuItemArgs) => {
        const isGraphWidget = loadedData?.data && loadedData?.type === CHARTKIT_WIDGET_TYPE.GRAPH;
        const isExportAllowed = !loadedData?.extra.dataExportForbidden;
        const isCriticalError = error && !error?.extra?.rowsExceededLimit;

        return Boolean(!isCriticalError && isExportAllowed && isGraphWidget);
    },
    action:
        customConfig?.action ||
        (({loadedData, propsData, chartsDataProvider: dataProvider}) => {
            window.open(
                (dataProvider || chartsDataProvider).getGoAwayLink(
                    {loadedData, propsData},
                    {
                        extraParams: {_chart_type: 'table'},
                        urlPostfix: '/preview',
                        idPrefix: '/editor/',
                    },
                ),
            );
        }),
});

export const getLinkMenuItem = (customConfig?: Partial<MenuItemConfig>): MenuItemConfig => ({
    id: MenuItemsIds.GET_LINK,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'get-code');
    },
    icon: customConfig?.icon || (
        <ChartKitIcon data={ArrowShapeTurnUpRight} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: ({loadedData}: MenuItemArgs) => Boolean(loadedData?.type),
    action:
        customConfig?.action ||
        function action({loadedData, propsData}) {
            return function render(props: MenuItemModalProps) {
                return (
                    <DialogShare
                        loadedData={loadedData}
                        propsData={propsData}
                        urlIdPrefix="/preview/"
                        onClose={props.onClose}
                        showHideComments={true}
                        showLinkDescription={true}
                        showMarkupLink={true}
                        hasDefaultSize={true}
                        initialParams={{
                            [CHARTKIT_URL_OPTIONS.HIDE_COMMENTS]: 1,
                            [COMMON_URL_OPTIONS.EMBEDDED]: 1,
                            [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
                        }}
                    />
                );
            };
        },
});

export const getEmbeddedMenuItem = (customConfig?: Partial<MenuItemConfig>): MenuItemConfig => ({
    id: MenuItemsIds.EMBEDDED,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'embedded');
    },
    icon: customConfig?.icon || (
        <ChartKitIcon data={Code} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: () => true,
    action:
        customConfig?.action ||
        function action({propsData, loadedData}) {
            return function render(props: MenuItemModalProps) {
                return (
                    <DialogShare
                        propsData={propsData}
                        loadedData={loadedData}
                        onClose={props.onClose}
                        hasDefaultSize={true}
                        initialParams={{
                            [COMMON_URL_OPTIONS.EMBEDDED]: 1,
                            [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
                        }}
                    />
                );
            };
        },
});
