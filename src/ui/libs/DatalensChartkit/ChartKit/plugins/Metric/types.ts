import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';

export type Diff = {
    value?: number | string | null;
    unit?: string;
    color?: string;
    sign?: string;
    formatted?: boolean;
};

export type NumberConfig = {
    value: number | string | null;
    unit?: string;
    color?: string;
    text?: string;
    formatted?: boolean;
};

export type MetricWidgetDataItem = {
    content: {
        current: NumberConfig;
        last?: NumberConfig;
        diff?: Diff;
        diffPercent?: Diff;
    };
    chart?: {
        graphs: {
            data: (number | null)[];
            color?: string;
            type?: string;
        }[];
    };
    background?: string;
    colorize?: string;
    colorizeInterval?: number;
    title?: string;
};

export type MetricWidgetData = {
    data?: MetricWidgetDataItem | MetricWidgetDataItem[];
    config?: {
        dataSources?: Record<string, string>;
        statface_graph?: Record<string, string>;
    };
};

export type MetricWidgetProps = {
    id: string;
    data: MetricWidgetData;
    onLoad?: (data?: ChartKitOnLoadData<'metric'>) => void;
};

export type MetricTileProps = {
    data: MetricWidgetDataItem;
    isMobile?: boolean;
    config?: {
        dataSources?: Record<string, string>;
        statface_graph?: Record<string, string>;
    };
};
