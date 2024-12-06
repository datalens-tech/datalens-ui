import React from 'react';

import type {Highcharts, HighchartsComment} from '@gravity-ui/chartkit/highcharts';
import {
    ArrowShapeTurnUpRight,
    ArrowUpRightFromSquare,
    ChevronsExpandUpRight,
    Code,
    LayoutCells,
    Megaphone,
    Pencil,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n, i18n} from 'i18n';
import {FOCUSED_WIDGET_PARAM_NAME, Feature, MenuItemsIds, PREVIEW_ROUTE, WidgetKind} from 'shared';
import {isWidgetTypeDoNotNeedOverlay} from 'ui/components/DashKit/plugins/Widget/components/helpers';
import {URL_OPTIONS as COMMON_URL_OPTIONS, DL} from 'ui/constants';
import {registry} from 'ui/registry';

import type {ChartWidgetDataRef} from '../../../components/Widgets/Chart/types';
import Utils from '../../../utils';
import {CHARTKIT_WIDGET_TYPE} from '../ChartKit/components/Widget/Widget';
import {getExportItem} from '../components/ChartKitBase/components/Header/components/Menu/Items/Export/Export';
import Inspector from '../components/ChartKitBase/components/Header/components/Menu/Items/Inspector/Inspector';
import type {ChartKitDataProvider} from '../components/ChartKitBase/types';
import ChartKitIcon from '../components/ChartKitIcon/ChartKitIcon';
import type DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {LoadedWidget, Widget as TWidget} from '../types';
import type {AlertsActionArgs} from '../types/menu';

import type {MenuItemConfig, MenuItemModalProps, MenuLoadedData} from './Menu';

import './MenuItems.scss';

const b = block('dl-chartkit-menu-items');

export const ICONS_MENU_DEFAULT_CLASSNAME = b('icon');
export const ICONS_MENU_DEFAULT_SIZE = DL.IS_MOBILE ? 18 : 16;

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
            if (!params || DL.IS_MOBILE) {
                return false;
            }
            const {loadedData, widget, error} = params;

            const isCriticalError = error && !error?.extra?.rowsExceededLimit;

            if (widget === null || !loadedData || error || !loadedData.entryId) {
                return false;
            }

            return (
                !isCriticalError &&
                (loadedData.isNewWizard || loadedData.type === CHARTKIT_WIDGET_TYPE.GRAPH)
            );
        },
        action: ({loadedData}: AlertsActionArgs) => {
            const menuAction = (options: AlertsActionArgs) => {
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
    extraOptions,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
    extraOptions?: Record<string, unknown>;
}): MenuItemConfig => ({
    id: MenuItemsIds.NEW_WINDOW,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'open-in-window');
    },
    icon: customConfig?.icon || (
        <Icon
            data={ArrowUpRightFromSquare}
            size={ICONS_MENU_DEFAULT_SIZE}
            className={ICONS_MENU_DEFAULT_CLASSNAME}
        />
    ),
    isVisible: () => true,
    action:
        customConfig?.action ||
        (({loadedData, propsData, chartsDataProvider: dataProvider}) => {
            const enableAP = Boolean(extraOptions?.enableActionParams);
            const link = (dataProvider || chartsDataProvider)?.getGoAwayLink(
                {loadedData, propsData},
                {
                    urlPostfix: '/preview',
                    idPrefix: '/editor/',
                    extraParams: enableAP ? {[COMMON_URL_OPTIONS.ACTION_PARAMS_ENABLED]: '1'} : {},
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
    isVisible: () => !DL.IS_MOBILE && (customConfig?.isVisible ? customConfig.isVisible() : true),
    action:
        customConfig?.action ||
        (({loadedData = {}, propsData, chartsDataProvider: dataProvider}) => {
            window.open(
                (dataProvider || chartsDataProvider)?.getGoAwayLink(
                    {loadedData, propsData},
                    {
                        idPrefix: '/navigate/',
                    },
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
        <Icon
            data={LayoutCells}
            size={ICONS_MENU_DEFAULT_SIZE}
            className={ICONS_MENU_DEFAULT_CLASSNAME}
        />
    ),
    isVisible: ({loadedData, error}: MenuItemArgs) => {
        const isExportAllowed = !loadedData?.extra.dataExportForbidden;
        const isCriticalError = error && !error?.extra?.rowsExceededLimit;
        const isChart =
            loadedData?.data &&
            ([WidgetKind.Graph, WidgetKind.D3] as string[]).includes(loadedData?.type);

        return Boolean(!isCriticalError && isExportAllowed && isChart);
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
        <Icon
            data={ArrowShapeTurnUpRight}
            size={ICONS_MENU_DEFAULT_SIZE}
            className={ICONS_MENU_DEFAULT_CLASSNAME}
        />
    ),
    isVisible: ({loadedData}: MenuItemArgs) => Boolean(loadedData?.type),
    action:
        customConfig?.action ||
        function action({loadedData, propsData}) {
            return function render(props: MenuItemModalProps) {
                const {DialogShare} = registry.common.components.getAll();
                const isEnabledEmbeds = Utils.isEnabledFeature(Feature.EnableEmbedsInDialogShare);
                let initialParams = {};
                if (isEnabledEmbeds) {
                    initialParams = {
                        [COMMON_URL_OPTIONS.EMBEDDED]: 1,
                        [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
                    };
                }
                return (
                    <DialogShare
                        loadedData={loadedData}
                        propsData={propsData}
                        urlIdPrefix={`/${PREVIEW_ROUTE}/`}
                        onClose={props.onClose}
                        withHideComments={isEnabledEmbeds}
                        withLinkDescription={true}
                        withEmbedLink={isEnabledEmbeds}
                        withCopyAndExitBtn={!isEnabledEmbeds}
                        withFederation={DL.USER.isFederationUser}
                        hasDefaultSize={true}
                        initialParams={initialParams}
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
        <Icon data={Code} size={ICONS_MENU_DEFAULT_SIZE} className={ICONS_MENU_DEFAULT_CLASSNAME} />
    ),
    isVisible: () => true,
    action:
        customConfig?.action ||
        function action({propsData, loadedData}) {
            return function render(props: MenuItemModalProps) {
                const {DialogShare} = registry.common.components.getAll();
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

export const getFullscreenMenuItem = (customConfig: Partial<MenuItemConfig>): MenuItemConfig => ({
    id: MenuItemsIds.FULLSCREEEN,
    get title() {
        return customConfig?.title || i18n('chartkit.menu', 'open-fullscreen');
    },
    icon: customConfig?.icon || (
        <Icon
            data={ChevronsExpandUpRight}
            size={ICONS_MENU_DEFAULT_SIZE}
            className={ICONS_MENU_DEFAULT_CLASSNAME}
        />
    ),
    isVisible: ({loadedData, error}: MenuItemArgs) => {
        const searchParams = new URLSearchParams(window.location.search);
        const isFullscreenMode = searchParams.has(FOCUSED_WIDGET_PARAM_NAME);

        return Boolean(
            DL.IS_MOBILE &&
                loadedData &&
                !error &&
                !isWidgetTypeDoNotNeedOverlay(loadedData.type) &&
                !isFullscreenMode,
        );
    },
    action: customConfig?.action || customConfig?.onFullscreenClick || function () {},
});
