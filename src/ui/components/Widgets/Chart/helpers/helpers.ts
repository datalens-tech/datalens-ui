import {DL, URL_OPTIONS} from 'constants/common';

import type {ConfigItemData} from '@gravity-ui/dashkit';
import type {AxiosResponse} from 'axios';
import type {History} from 'history';
import isEmpty from 'lodash/isEmpty';
import type {StringParams} from 'shared';
import {DashTabItemType, FOCUSED_WIDGET_PARAM_NAME, Feature, isTrueArg} from 'shared';
import {isExternalControl} from 'ui/components/DashKit/plugins/Control/utils';
import type DatalensChartkitCustomError from 'ui/libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import {ERROR_CODE} from 'ui/libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import {DASH_WIDGET_TYPES} from 'ui/units/dash/modules/constants';

import type {ChartsStats} from '../../../../../shared/types/charts';
import type {ChartKitLoadSuccess} from '../../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {ChartKitWrapperOnLoadProps} from '../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {
    ChartsData,
    ResponseError,
    ResponseSourcesSuccess,
} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {
    CombinedError,
    LoadedWidgetData,
    Widget,
} from '../../../../libs/DatalensChartkit/types';
import Utils from '../../../../utils';
import {isWidgetTypeDoNotNeedOverlay} from '../../../DashKit/plugins/Widget/components/helpers';
import type {CurrentTab, WidgetPluginDataWithTabs} from '../../../DashKit/plugins/Widget/types';
import type {
    DashkitMetaDataItemBase,
    DashkitOldMetaDataItemBase,
    DatasetsData,
    DatasetsFieldsListData,
} from '../../../DashKit/plugins/types';
import type {AdjustWidgetLayoutProps} from '../../../DashKit/utils';
import {adjustWidgetLayout} from '../../../DashKit/utils';
import type {State as ChartState} from '../store/types';
import type {
    ChartContentProps,
    ChartWithProviderProps,
    ResolveWidgetControlDataRefArgs,
} from '../types';

export const COMPONENT_CLASSNAME = 'dl-widget';

/**
 * copied from DL Dashkit
 */
export const X_CSRF_TOKEN_HEADER = 'X-CSRF-Token';
/**
 * copied from DL Dashkit
 */
export const DATALENS_DEBUG_MODE_KEY = 'datalens-debug-mode';
/**
 * copied from DL Dashkit
 */
export const DRAGGABLE_HANDLE_CLASS_NAME = 'dl-draggable-handle-element';

/**
 * copied from DL Chartkit use later in restyle dash relations
 */
export const CHARTKIT_WIDGET_TYPE = {
    GRAPH: 'graph',
    TABLE: 'table',
    MARKDOWN: 'markdown',
    ALERT: 'alert',
};

/**
 * informing errors that should not interfere with the display of relations
 */
const ALLOWED_ERRORS = [
    ERROR_CODE.NO_DATA,
    ERROR_CODE.TOO_MANY_LINES,
    ERROR_CODE.UI_SANDBOX_EXECUTION_TIMEOUT,
];

/**
 * For current (old relations) for charts only
 * @param tabs
 * @param tabIndex
 * @param loadData
 */
export const getWidgetMetaOld = ({
    tabs,
    tabIndex,
    loadData,
}: {
    tabs: Array<CurrentTab>;
    tabIndex: number;
    loadData: LoadedWidgetData<ChartsData>;
}) => {
    return tabs.map((tabItem: CurrentTab, index) => {
        let result: DashkitOldMetaDataItemBase;

        const loadedData:
            | (Omit<
                  Partial<DashkitMetaDataItemBase> & Widget & ChartsData,
                  'type' | 'usedParams' | 'defaultParams'
              > & {
                  type: ChartContentProps['widgetType'];
                  usedParams: ChartsData['usedParams'];
              })
            | null = loadData ? {...loadData} : null;

        if (index === tabIndex && loadedData) {
            result = {
                id: tabItem.id,
                entryId: tabItem.chartId,
                usedParams: loadedData.usedParams ? Object.keys(loadedData.usedParams || {}) : null,
                datasets: loadedData.datasets,
                type: loadedData.type as DashTabItemType,
                // deprecated
                datasetFields: loadedData.datasetFields,
                datasetId: loadedData.datasetId,
                enableFiltering: tabItem.enableActionParams || false,
            };
        } else {
            result = {id: tabItem.id, entryId: tabItem.chartId};
        }

        return result;
    });
};

/**
 * We get duplicated from api, need to clear it to prevent problems with doubles
 * (in ex. in dash relations)
 * @param datasets
 */
const getUniqDatasetsFields = (datasets?: Array<DatasetsData>) => {
    datasets?.forEach((dataset) => {
        if (!dataset.fieldsList) {
            return;
        }
        const guids: Record<string, string> = {};
        const newFieldList: DatasetsFieldsListData[] = [];

        dataset.fieldsList.forEach((fieldItem) => {
            if (!(fieldItem.guid in guids)) {
                guids[fieldItem.guid] = '';
                newFieldList.push(fieldItem);
            }
        });
        dataset.fieldsList = newFieldList;
    });
    return datasets;
};

/**
 * For new (by flag relations) for charts only
 * @param tabs
 * @param id
 * @param loadData
 * @param savedData
 */
export const getWidgetMeta = ({
    tabs,
    id,
    loadData,
    savedData,
    error,
}: {
    tabs: Array<CurrentTab>;
    id: string;
    loadData: LoadedWidgetData<ChartsData>;
    savedData: LoadedWidgetData<ChartsData>;
    error: CombinedError | null;
}) => {
    return tabs.map((tabWidget) => {
        let loadedData:
            | (Omit<
                  Partial<DashkitMetaDataItemBase> & Widget & ChartsData,
                  'type' | 'usedParams' | 'defaultParams'
              > & {
                  type: ChartContentProps['widgetType'];
                  usedParams: ChartsData['usedParams'];
              })
            | null = null;
        if (loadData?.entryId === tabWidget.chartId) {
            loadedData = loadData;
        } else if (savedData?.entryId === tabWidget.chartId) {
            loadedData = savedData;
        }

        const loadDataError = (loadData as unknown as AxiosResponse<ResponseError>)?.data?.error;
        const errorCode = (error as DatalensChartkitCustomError)?.code;

        const loadedWithError = Boolean(
            (loadDataError || error) &&
                (typeof errorCode !== 'string' || !ALLOWED_ERRORS.includes(errorCode)),
        );

        const metaInfo: Omit<DashkitMetaDataItemBase, 'defaultParams'> &
            Omit<DashkitOldMetaDataItemBase, 'chartId'> = {
            layoutId: id,
            chartId: tabWidget.chartId,
            widgetId: tabWidget.id,
            title: tabWidget.title,
            label: (loadedData?.key && Utils.getEntryNameFromKey(loadedData?.key || '')) || '',
            params: tabWidget.params,
            enableFiltering: tabWidget.enableActionParams || false,
            loaded: Boolean(loadedData),
            entryId: tabWidget.chartId,
            usedParams: loadedData?.usedParams
                ? Object.keys(loadedData?.usedParams || {}) || null
                : null,
            datasets:
                getUniqDatasetsFields(loadedData?.datasets || loadedData?.extra?.datasets) || null,
            datasetId:
                (loadedData?.sources as ResponseSourcesSuccess)?.fields?.datasetId ||
                loadedData?.extra?.datasets?.[0]?.id ||
                '',
            type: (loadedData?.type as DashTabItemType) || null,
            visualizationType: loadedData?.libraryConfig?.chart?.type || null,
            loadError: loadedWithError,
            isWizard: Boolean(loadedData?.isNewWizard || loadedData?.isOldWizard),
            isEditor: Boolean(loadedData?.isEditor),
            isQL: Boolean(loadedData?.isQL),
        };

        return metaInfo;
    });
};

export const getWidgetSelectorMetaOld = ({
    id,
    chartId,
    loadedData,
}: {
    id: string;
    chartId: string;
    loadedData: ResolveWidgetControlDataRefArgs | null;
}) => {
    const result: DashkitOldMetaDataItemBase = {
        id,
        entryId: chartId,
        usedParams: loadedData?.usedParams ? Object.keys(loadedData.usedParams || {}) : null,
        type: DashTabItemType.Control,
        // deprecated
        //datasetFields: loadedData?.datasetFields,
        datasets: loadedData?.extra?.datasets || null,
        datasetId: (loadedData?.sources as ResponseSourcesSuccess)?.fields?.datasetId || '',
    };

    return result;
};

export const getWidgetSelectorMeta = ({
    id,
    chartId,
    loadedData,
    error,
    widgetParamsDefaults,
    data,
}: {
    id: string;
    chartId: string;
    loadedData: ResolveWidgetControlDataRefArgs | null;
    error: CombinedError | null;
    widgetParamsDefaults: StringParams;
    data: WidgetPluginDataWithTabs | ConfigItemData;
}) => {
    const loadedWithError = Boolean(
        (loadedData as unknown as AxiosResponse<ResponseError>)?.data?.error || error,
    );

    let title = '';

    if (isExternalControl(data)) {
        title = data.title;
    }

    const metaInfo: Omit<DashkitMetaDataItemBase, 'defaultParams'> &
        Omit<DashkitOldMetaDataItemBase, 'chartId'> & {widgetParams: StringParams} = {
        layoutId: id,
        chartId,
        widgetId: id,
        title,
        label: (loadedData?.key && Utils.getEntryNameFromKey(loadedData?.key || '')) || '',
        params: loadedData?.params || {},
        widgetParams: widgetParamsDefaults || {},
        enableFiltering: false,
        loaded: Boolean(loadedData),
        entryId: chartId,
        usedParams: loadedData?.usedParams
            ? Object.keys(loadedData?.usedParams || {}) || null
            : null,
        datasets: loadedData?.datasets || null,
        datasetId: (loadedData?.sources as ResponseSourcesSuccess)?.fields?.datasetId || '',
        type: (loadedData?.type as DashTabItemType) || null,
        visualizationType: null,
        loadError: loadedWithError,
    };

    return metaInfo;
};

/**
 * helper for preparing set of constants for chart & widget render
 * @param props
 */
export const getPreparedConstants = (props: {
    isLoading: ChartState['isLoading'];
    error: ChartState['error'];
    loadedData: ChartContentProps['loadedData'];
    isReloadWithNoVeil: ChartState['isReloadWithNoVeil'];
    noVeil: ChartContentProps['noVeil'];
    noLoader: ChartContentProps['noLoader'];
    isSilentReload: ChartState['isSilentReload'];
    widgetId?: string;
    history?: History<unknown>;
    hideTitle?: boolean | undefined;
    tabsLength?: number;
    disableChartLoader?: boolean;
    needWaitForDSFields?: boolean;
}) => {
    const {
        loadedData,
        hideTitle,
        tabsLength,
        widgetId,
        history,
        isLoading,
        error,
        isReloadWithNoVeil,
        noVeil,
        noLoader,
        isSilentReload,
        disableChartLoader,
        needWaitForDSFields,
    } = props;
    const widgetType = loadedData?.type;
    let isFullscreen = false;
    let noControls = false;
    if (history) {
        const searchParams = new URLSearchParams(history.location.search);
        isFullscreen = widgetId === searchParams.get(FOCUSED_WIDGET_PARAM_NAME) && DL.IS_MOBILE;
        noControls = isTrueArg(searchParams.get(URL_OPTIONS.NO_CONTROLS));
    }

    const hideTabs = isFullscreen ? true : Boolean(tabsLength === 1 && hideTitle);

    const isFirstLoadOrAfterError = loadedData === null;

    const showLoader =
        Boolean(isLoading || needWaitForDSFields) &&
        !disableChartLoader &&
        ((!isSilentReload && !noLoader) || isFirstLoadOrAfterError);

    const mods = {
        'no-tabs': !isFullscreen && hideTabs,
        fullscreen: isFullscreen,
        'no-controls': noControls,
        [String(widgetType)]: Boolean(widgetType),
    };
    const hasVeil = Boolean(loadedData && !error && !noVeil && !isReloadWithNoVeil);

    const noOverlay =
        !DL.IS_MOBILE || !loadedData || error || isWidgetTypeDoNotNeedOverlay(widgetType || '');
    const showOverlayWithControlsOnEdit = !noOverlay && !isFullscreen;

    return {
        mods,
        widgetBodyClassName: DL.IS_MOBILE ? 'dl-chartkit-body-mix' : undefined,
        hasHiddenClassMod: Boolean(isLoading && error),
        veil: hasVeil,
        showLoader,
        isFullscreen,
        hideTabs,
        widgetType,
        showOverlayWithControlsOnEdit,
        noControls,
    };
};

export const removeEmptyNDatasetFieldsProperties = (
    obj: StringParams,
    removeFieldsList?: string[] | null,
) => {
    const checkRemoveList = Boolean(removeFieldsList?.length);
    return Object.entries(obj).reduce((result, [key, value]) => {
        if (value !== null && value !== undefined) {
            if (checkRemoveList) {
                if (!removeFieldsList?.includes(key)) {
                    result[key] = value;
                }
            } else {
                result[key] = value;
            }
        }
        return result;
    }, {} as StringParams);
};

/**
 * method copied from DL Chartkit
 * should call when data.status === 'success'
 * @param data
 * @param scope
 * @param chartsDataProvider
 */
export const pushStats = (
    data: ChartKitWrapperOnLoadProps,
    scope: ChartsStats['scope'],
    chartsDataProvider: ChartWithProviderProps['dataProvider'],
) => {
    if (Utils.isEnabledFeature(Feature.EnableDashChartStat)) {
        chartsDataProvider.pushStats?.(data as ChartKitLoadSuccess<ChartsData>, {
            groupId: DL.REQUEST_ID,
            scope,
        });
    }
};

/**
 * get current tab index from tabs
 * @param tabs
 * @param tabId
 */
export const getTabIndex = (tabs: WidgetPluginDataWithTabs['tabs'], tabId: string) => {
    if (!tabs) {
        return 0;
    }
    const index = tabId
        ? tabs.findIndex(({id}: {id: string}) => id === tabId)
        : tabs.findIndex(({isDefault}: {isDefault: boolean}) => isDefault);

    return index === -1 ? 0 : index;
};

/**
 * widgets with autoheight setting
 * @param widgetType
 */
export const isWidgetTypeWithAutoHeight = (widgetType: string) => {
    return (
        widgetType === DASH_WIDGET_TYPES.TABLE ||
        widgetType === DASH_WIDGET_TYPES.MARKDOWN ||
        widgetType === DASH_WIDGET_TYPES.METRIC ||
        widgetType === DASH_WIDGET_TYPES.METRIC2 ||
        widgetType === DASH_WIDGET_TYPES.MARKUP
    );
};

/**
 * method copied from DL Dashkit
 * @param type
 * @param tabItem
 * @param widgetId
 * @param rootNode
 * @param gridLayout
 * @param layout
 * @param cb
 */
export const updateImmediateLayout = ({
    type,
    autoHeight,
    widgetId,
    rootNode,
    gridLayout,
    layout,
    cb,
}: AdjustWidgetLayoutProps & {
    type?: string;
    autoHeight?: boolean;
}) => {
    if (!type) {
        return;
    }
    const newAutoHeight = isWidgetTypeWithAutoHeight(type) ? autoHeight : false;
    adjustWidgetLayout({
        widgetId,
        needSetDefault: !newAutoHeight,
        rootNode,
        gridLayout,
        layout,
        cb,
    });
};

export const isAllParamsEmpty = (params?: StringParams | null) => {
    const res = Object.values(params || {}).every((item) => {
        if (Array.isArray(item)) {
            return isEmpty(item.filter((val) => !isEmpty(String(val).trim())));
        } else {
            return isEmpty(String(item).trim());
        }
    });
    return Boolean(res);
};
