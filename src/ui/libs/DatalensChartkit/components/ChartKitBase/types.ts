import type React from 'react';

import type {CancelTokenSource} from 'axios';
import type {Split} from 'react-split-pane';
import type {DashTabItemControlSourceType, StringParams} from 'shared';

import type {ChartWidgetDataRef} from '../../../../components/Widgets/Chart/types';
import type {WidgetType} from '../../../../units/dash/modules/constants';
import type {ChartKit} from '../../ChartKit/ChartKit';
import type {ChartsData, ChartsProps} from '../../modules/data-provider/charts';
import type {
    CombinedError,
    DataProvider,
    LoadedWidget,
    LoadedWidgetData,
    OnChangeData,
    Widget as TWidget,
    WidgetDashState,
} from '../../types';
import type {MenuItems} from '../../types/menu';

export interface ChartKitWrapperLoadSuccess {
    status: 'success';
    requestId: string;
    data:
        | {
              loadedData: TWidget & ChartKitDataProvider;
              widget: LoadedWidget;
              widgetRendering: number | null;
              yandexMapAPIWaiting: number | null;
              widgetData?: ChartWidgetDataRef;
          }
        | {
              loadedData: LoadedWidgetData<ChartsData>;
              widgetData?: ChartWidgetDataRef;
          };
}

export type ChartKitWrapperLoadError = {
    status: 'error';
    requestId: string;
    data: {
        error: CombinedError;
        loadedData?: LoadedWidgetData;
    };
};

export type ChartKitWrapperLoadStatusUnknown = {
    status: null;
};

export type ChartKitWrapperOnLoadProps = ChartKitWrapperLoadSuccess | ChartKitWrapperLoadError;

export type ChartKitDataProvider = DataProvider<ChartsProps, ChartsData, CancelTokenSource>;

export type ChartKitBaseWrapperProps = ChartsProps & {
    dataProvider: ChartKitDataProvider;

    onLoadStart?: () => void;
    onLoad?: ({status, requestId, data}: ChartKitWrapperOnLoadProps) => void;
    onChange?: (data: OnChangeData) => void;
    transformLoadedData?: (data: LoadedWidgetData) => LoadedWidgetData;

    noControls?: boolean;
    widgetType?: DashTabItemControlSourceType | WidgetType;
    compactLoader?: boolean;
    noLoader?: boolean;
    noVeil?: boolean;
    loaderDelay?: number;

    menu?: MenuItems<ChartsData, ChartsProps> | Array<MenuItems<ChartsData, ChartsProps>>;
    hideMenu?: boolean;
    requestIdPrefix?: string;

    nonBodyScroll?: boolean;

    deferredInitialization?: boolean;
    deferredInitializationMargin?: number;

    widgetBodyClassName?: string;

    splitTooltip?: boolean;

    paneSplitOrientation?: Split;

    widgetDashState?: WidgetDashState;
};

export type ChartKitBaseWrapperWithRefProps = ChartKitBaseWrapperProps & {
    forwardedRef: React.RefObject<ChartKit> | React.MutableRefObject<ChartKit | null>;
};

export interface ChartKitWrapperState {
    forceUpdate: boolean;
    dataProviderSavedProps: ChartKitDataProvider | null;
    runtimeParams: StringParams;
    // for cases when the parameters are updated by internal control, and then from the outside via props
    isDataProviderPropsNotChanged: boolean;
    // {proceed: null} sometimes gets from Highcharts, for example, when after a successful download, there will be a download with the network turned off
    // table resize
    requestId: string;
    requestCancellation: CancelTokenSource;
    deferred?: boolean;
}

export type ChartKitWrapperParams = {
    onError: ({error}: {error: CombinedError}) => void;
    onRetry?: () => void;
    onLoad?: (params: {
        widget?: LoadedWidget;
        widgetRendering?: number | null;
        yandexMapAPIWaiting?: number | null;
    }) => void;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    getControls: (params: StringParams) => void;
};

export type DataProps = Omit<ChartsProps, 'params'> & {
    params: ChartsProps['params'];
    widgetData?: {widgetId: string};
};

type ChartAxis = {
    index: number;
    title: string;
};

export interface LoadedChartInfo {
    yAxis: ChartAxis[];
    series: {
        yaxis: number;
        name: string;
        id?: string;
    }[];
    windowSecs: number;
    timeShift: number;
}
