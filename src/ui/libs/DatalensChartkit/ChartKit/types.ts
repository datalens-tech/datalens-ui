import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';
import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import type {Split} from 'react-split-pane';

import type {
    CombinedError,
    LoadedWidgetData,
    OnChangeData,
    OnLoadData,
    TableWidgetData,
    WidgetDashState,
} from '../types';

import type YandexMap from './modules/yandex-map/yandex-map';
import type {
    HighchartsMapWidgetData,
    MarkupWidgetData,
    MetricWidgetData,
    YandexMapWidgetData,
} from './plugins';

export type ChartKitAdapterProps = {
    loadedData?: LoadedWidgetData;
    lang?: string;
    isMobile?: boolean;
    splitTooltip?: boolean;
    paneSplitOrientation?: Split;
    widgetDashState?: WidgetDashState;
    nonBodyScroll?: boolean;
    onLoad?: (args: OnLoadData) => void;
    onError?: ({error}: {error: CombinedError}) => void;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    requestId?: string;
    noControls?: boolean;
    onRetry?: () => void;
    rootNodeRef: React.RefObject<HTMLDivElement | null>;
    backgroundColor?: string;
} & Pick<ChartKitProps<ChartKitType>, 'onRender' | 'onChartLoad' | 'renderPluginLoader'>;

declare module '@gravity-ui/chartkit' {
    interface ChartKitWidget {
        metric: {
            data: MetricWidgetData;
            widget: never;
        };
        highchartsmap: {
            data: HighchartsMapWidgetData;
            widget: Highcharts.Chart;
        };
        yandexmap: {
            data: YandexMapWidgetData;
            widget: YandexMap;
        };
        markup: {
            data: MarkupWidgetData;
            widget: never;
        };
        table: {
            data: any;
            widget: TableWidgetData;
        };
        'blank-chart': {
            data: any;
            widget: unknown;
        };
    }
}
