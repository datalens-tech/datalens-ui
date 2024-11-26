import type React from 'react';

import type {CkHighchartsSeriesOptionsType, Highcharts} from '@gravity-ui/chartkit/highcharts';
import type {CancelTokenSource} from 'axios';
import type {Split} from 'react-split-pane';
import type {DashTabItemControlSourceType, MenuItemsIds, StringParams} from 'shared';
import type {
    Widget as ChartWidget,
    CombinedError,
    ControlWidget,
    LoadedWidget,
    LoadedWidgetData,
    OnChangeData,
    WidgetDashState,
} from 'ui/libs/DatalensChartkit/types';
import type {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import type {ChartKit} from '../../../libs/DatalensChartkit/ChartKit/ChartKit';
import type {
    ChartInitialParams,
    ChartKitLoadSuccess,
} from '../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {
    ChartKitDataProvider,
    ChartKitWrapperLoadStatusUnknown,
    ChartKitWrapperOnLoadProps,
} from '../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {Props as DrillProps} from '../../../libs/DatalensChartkit/components/Drill/Drill';
import type {MenuItemConfig} from '../../../libs/DatalensChartkit/menu/Menu';
import type {
    ChartsData,
    ChartsProps,
} from '../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {WidgetType} from '../../../units/dash/modules/constants';
import type {WidgetPluginProps} from '../../DashKit/plugins/Widget/types';

type ChartKitBaseWrapperProps = ChartsProps & {
    onInnerParamsChanged?: (params: StringParams) => void;
    changedDef?: Boolean;
    deferred?: Boolean;
    dataProvider: ChartKitDataProvider;

    onLoadStart?: () => void;

    /** @deprecated use onChartLoad and onChartRender callbacks instead **/
    onLoad?: ({status, requestId, data}: ChartKitWrapperOnLoadProps) => void;
    /**
     * called when request answered
     * @param status
     * @param requestId
     * @param data
     */
    onChartLoad?: ({status, requestId, data}: ChartKitWrapperOnLoadProps) => void;
    /**
     * called on each chart rerender
     * @param status
     * @param requestId
     * @param data
     */
    onChartRender?: (
        args: ChartKitWrapperOnLoadProps | ChartKitWrapperLoadStatusUnknown,
        dataProvider: ChartKitDataProvider,
    ) => void;

    /**
     * will be awaited before commiting load event
     */
    onBeforeChartLoad?: () => Promise<void>;

    onChange?: (data: OnChangeData) => void;
    transformLoadedData?: (data: LoadedWidgetData) => LoadedWidgetData;

    noControls?: boolean;
    widgetType?: DashTabItemControlSourceType | WidgetType;
    compactLoader?: boolean;
    noLoader?: boolean;
    noVeil?: boolean;
    loaderDelay?: number;
    disableChartLoader?: boolean;

    hideMenu?: boolean;
    menuType?: GetChartkitMenuByType['type'];
    /**
     * custom options for wrapping action in chartkit menu option
     * ex. used for custom screenshort wrap action in wizard
     */
    customMenuOptions?: Record<
        MenuItemsIds,
        {
            actionWrapper?: (args: MenuItemConfig['action']) => void;
        }
    >;
    /**
     * common chartkit menu prepare config
     */
    menuChartkitConfig?: {
        config: {
            canEdit?: boolean;
        };
        chartsDataProvider: ChartKitDataProvider;
    };

    requestIdPrefix?: string;

    nonBodyScroll?: boolean;

    deferredInitialization?: boolean;
    deferredInitializationMargin?: number;

    widgetBodyClassName?: string;

    splitTooltip?: boolean;
    skipReload?: boolean;

    renderPluginLoader?: () => React.ReactNode;
    actionParamsEnabled?: boolean;
    paneSplitOrientation?: Split;
    widgetDashState?: WidgetDashState;
};

export type ChartWidgetProviderPropsWithRefProps = Omit<
    WidgetPluginProps,
    'debouncedAdjustWidgetLayout'
> &
    ChartsProps & {
        forwardedRef: React.RefObject<ChartKit>;
        usageType: 'widget';
    };

export type ChartProviderPropsWithRefProps = Partial<Omit<ChartKitBaseWrapperProps, 'onLoad'>> &
    ChartsProps & {
        forwardedRef: React.RefObject<ChartKit> | React.MutableRefObject<ChartKit | null>;
        usageType: 'chart';
        isPageHidden?: boolean;
        autoupdateInterval?: number;
    };

export type ChartSelectorWithRefProps = Omit<WidgetPluginProps, 'debouncedAdjustWidgetLayout'> &
    Partial<Omit<ChartKitBaseWrapperProps, 'onLoad'>> &
    ChartsProps & {
        forwardedRef: React.RefObject<ChartKit>;
        usageType: 'control';
        widgetId: WidgetPluginProps['id'];
    };

export type ChartSelectorWidgetProps = ChartWidgetProviderPropsWithRefProps &
    Pick<ChartSelectorWithRefProps, 'widgetId'> &
    Omit<ChartKitBaseWrapperProps, 'onLoad'>;

export type ChartAlertProps = Pick<
    ChartKitBaseWrapperProps,
    'onChartRender' | 'onChartLoad' | 'onLoadStart'
> &
    ChartsProps & {
        dataProvider: ChartKitDataProvider;
        forwardedRef: React.RefObject<ChartKit>;
    };

type ChartWidgetWithProviderProps = Omit<WidgetPluginProps, 'debouncedAdjustWidgetLayout'> &
    ChartsProps & {
        dataProvider: ChartKitDataProvider;
    };

export type ChartWithProviderProps = ChartsProps & {
    dataProvider: ChartKitDataProvider;
};

export type ChartWrapperWithRefProps =
    | ChartWidgetProviderPropsWithRefProps
    | ChartProviderPropsWithRefProps
    | ChartSelectorWithRefProps;

export type ChartWithProviderWithRefProps = ChartProviderPropsWithRefProps;

export type ChartWrapperWithProviderProps = ChartWrapperWithRefProps & {workbookId?: string | null};

export type ChartWidgetProps = ChartWidgetProviderPropsWithRefProps &
    ChartWidgetWithProviderProps &
    Omit<ChartKitBaseWrapperProps, 'onLoad'>;

export type ChartNoWidgetProps = ChartProviderPropsWithRefProps &
    ChartWithProviderProps &
    Omit<ChartKitBaseWrapperProps, 'onLoad'> & {
        rootNodeRef?: React.RefObject<HTMLDivElement>;
        chartKitRef?: React.RefObject<ChartKit>;
    };

export type ChartWidgetPropsWithContext = ChartWidgetProviderPropsWithRefProps &
    ChartWidgetWithProviderProps;

export type DataProps = Omit<ChartsProps, 'params'> & {params: ChartsProps['params']};

export type OnLoadChartkitData = {
    widget?: LoadedWidget;
    widgetRendering?: number | null;
    yandexMapAPIWaiting?: number | null;
};

export type ChartKitWrapperParams = {
    onError: ({error}: {error: CombinedError}) => void;
    onLoad?: ChartKitWrapperOnLoadProps;
    onRender?: (params: OnLoadChartkitData) => void;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onRetry?: () => void;
    getControls: (params: StringParams) => void;
    paneSplitOrientation?: 'vertical' | 'horizontal';
    widgetDashState?: WidgetDashState;
};

export type ChartWidgetData =
    | (ChartKitLoadSuccess<ChartsData>['data']['widget'] & {
          // fields and functions from ChartKit
          series?: Highcharts.Series;
          xAxis?: Highcharts.Chart['xAxis'];
          navigator?: Highcharts.Options['navigator'];
          time?: Highcharts.Chart['time'];
          plotLeft?: Highcharts.Chart['plotLeft'];
          plotWidth?: Highcharts.Chart['plotWidth'];
          graphs?: CkHighchartsSeriesOptionsType;
          options?: Highcharts.Chart['options'];
          chart?: Highcharts.Chart;
          container?: Highcharts.Chart['container'];
          pointsForInitialRefresh?: Highcharts.Chart['pointsForInitialRefresh'];
          userOptions?: Highcharts.Options & {
              _getComments: () => void;
              id: string;
          };
          setOpacity?: (layerId: string, opacity: number) => void;
          setVisibility?: (layerId: string, opacity: number) => void;
          redraw?: (args: unknown) => void;
          reflow?: (args: unknown) => void;
          addSeries?: Highcharts.ChartEventsOptions['addSeries'];
          update?: (args: unknown) => void;
          proceed?: (args: unknown) => void;
          getDataRows?: (args: unknown) => void;
      })
    | null;
export type ChartWidgetDataRef = React.MutableRefObject<ChartWidgetData> | null;

export type ChartContentProps = Pick<
    ChartProviderPropsWithRefProps,
    | 'widgetBodyClassName'
    | 'forwardedRef'
    | 'noControls'
    | 'nonBodyScroll'
    | 'transformLoadedData'
    | 'splitTooltip'
    | 'compactLoader'
    | 'loaderDelay'
    | 'noVeil'
    | 'noLoader'
    | 'menuType'
    | 'customMenuOptions'
    | 'menuChartkitConfig'
    | 'dataProvider'
    | 'hideMenu'
    | 'renderPluginLoader'
    | 'forceShowSafeChart'
> &
    ChartKitWrapperParams & {
        hasHiddenClassMod: boolean;
        showLoader: boolean;
        veil: boolean;
        chartId: ChartsProps['id'];
        requestId: ChartsData['requestId'];
        error: CombinedError | null;
        loadedData:
            | LoadedWidgetData<ChartsData>
            | (LoadedWidgetData<ChartsData> & ControlWidget & ChartsData['extra']);
        drillDownFilters: DrillProps['filters'];
        drillDownLevel: DrillProps['level'];
        widgetType?: DashTabItemControlSourceType | WidgetType | ChartWidget['type'];
        dataProps?: DataProps;
        yandexMapAPIWaiting?: number | null;
        widgetDataRef: ChartWidgetDataRef;
        widgetRenderTimeRef: React.MutableRefObject<number | null>;
        onFullscreenClick?: () => void;
        showOverlayWithControlsOnEdit?: boolean;
        isWidgetMenuDataChanged?: boolean;
        initialParams: StringParams;
        enableActionParams?: boolean;
        rootNodeRef: React.RefObject<HTMLDivElement | null>;
        backgroundColor?: string;
    };

export type WidgetDataRef = React.MutableRefObject<
    ChartKitLoadSuccess<ChartsData>['data']['widget'] | null
>;

export type ChartControlsType = Pick<ChartKitWrapperParams, 'onError' | 'onChange'> &
    Pick<ChartsProps, 'id'> &
    Pick<ChartContentProps, 'nonBodyScroll'> & {
        data: ChartContentProps['loadedData'];
        onLoad: ChartKitWrapperParams['onRender'];
        initialParams: ChartInitialParams;
        getControls?: ChartKitWrapperParams['getControls'];
        onUpdate?: (data: OnChangeData) => void;
    };

export type ResolveWidgetControlDataRefArgs =
    | (LoadedWidgetData<ChartsData> & ControlWidget & ChartsData['extra'])
    | null;

export type ResolveWidgetDataRefArgs = LoadedWidgetData<ChartsData>;

export type ResolveMetaDataRef = (args: unknown) => void;
export type ResolveWidgetDataRef = (args: ResolveWidgetDataRefArgs) => void;
export type ResolveWidgetControlDataRef = (args: ResolveWidgetControlDataRefArgs) => void;

export type GetWidgetRequestData = {
    props: DataProps;
    requestId: string;
    requestCancellation: CancelTokenSource;
};

export type CurrentRequestStateItem = {
    requestCancellation: CancelTokenSource | null;
    status: 'loading' | 'loaded' | 'error' | 'unset' | 'canceled';
};

export type CurrentRequestState = Record<string, CurrentRequestStateItem>;

export type ChartSelectorWithWrapRefProps = {
    reflow: (args: unknown) => void;
    reload: (arg: {silentLoading?: boolean; noVeil?: boolean}) => void;
    getCurrentTabChartId: () => string;
    getMeta: () => Promise<ResolveWidgetControlDataRefArgs | null>;
};
