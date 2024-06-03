import type {ChartKitOnLoadData, ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';

export type HighchartsMapWidgetDataItem = {
    map: {
        name?: string;
        data: Record<string, unknown>[];
        mapData: Record<string, unknown>[];
    }[];
};

export type HighchartsMapWidgetData = {
    data?: HighchartsMapWidgetDataItem;
    config?: {
        [key: string]: unknown;
    };
    libraryConfig?: {
        [key: string]: unknown;
    };
};

export type HighchartsMapWidgetProps = {
    id: string;
    data: HighchartsMapWidgetData;
    splitTooltip?: boolean;
    nonBodyScroll?: boolean;
    onLoad?: (data?: ChartKitOnLoadData<'highchartsmap'>) => void;
} & Pick<ChartKitProps<ChartKitType>, 'onRender' | 'onChartLoad'>;
