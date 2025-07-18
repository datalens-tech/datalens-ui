import type {
    DATASET_FIELD_TYPES,
    FeatureConfig,
    IChartEditor,
    ServerChartsConfig,
    ServerColor,
    ServerField,
    ServerLabel,
    ServerLayerSettings,
    ServerPlaceholder,
    ServerPointSizeConfig,
    ServerShape,
    ServerShapesConfig,
    ServerSort,
    ServerTooltip,
    ServerTooltipConfig,
    WrappedHTML,
    WrappedMarkup,
} from '../../../../../../shared';
import type {ApiV2RequestField} from '../../../../../../shared/types/bi-api/v2';
import type {WrappedMarkdown} from '../../../../../../shared/utils/markdown';
import type {ChartColorsConfig} from '../types';

export type PrepareFunction = (args: PrepareFunctionArgs) => any;

export type PrepareFunctionArgs = {
    placeholders: ServerPlaceholder[];
    resultData: PrepareFunctionResultData;
    fields: ApiV2RequestField[];
    colors: ServerColor[];
    sort: ServerSort[];
    idToTitle: {[key: string]: string};
    shared: ServerChartsConfig;
    layerSettings: ServerLayerSettings;
    ChartEditor: IChartEditor;
    colorsConfig: ChartColorsConfig;
    geopointsConfig?: ServerPointSizeConfig;
    tooltips: ServerTooltip[];
    tooltipConfig?: ServerTooltipConfig;
    labels: ServerLabel[];
    idToDataType: Record<string, DATASET_FIELD_TYPES>;

    visualizationId: string;
    shapes: ServerShape[];
    shapesConfig: ServerShapesConfig;
    segments: ServerField[];
    datasets: string[];
    layerChartMeta?: LayerChartMeta;
    usedColors?: (string | undefined)[];
    disableDefaultSorting?: boolean;
    features: FeatureConfig;
    categories?: (string | number)[];
};

export type PrepareFunctionDataRow = (string | null)[];

export type PrepareFunctionResultData = {
    data: PrepareFunctionDataRow[];
    legend?: number[][];
    order: ResultDataOrder;
    totals: (string | null)[];
};

export type ChartKitFormatSettings = {
    format?: null;
    chartKitFormatting?: boolean;
    chartKitPrecision?: number;
    chartKitPrefix?: string;
    chartKitPostfix?: string;
    chartKitUnit?: string;
    chartKitFormat?: string;
    chartKitLabelMode?: string;
    chartKitShowRankDelimiter?: boolean;
};

export type ResultDataOrder = (ResultDataOrderItem | ResultDataOrderItem[])[];

export type ResultDataOrderItem = {
    datasetId: string;
    title: string;
    dataType?: string;
    legendItemId?: number;
};

export type Categories = (string | number)[];

export type LayerChartMeta = {
    isCategoriesSortAvailable?: boolean;
};

export type PiePoint = {
    name: string | WrappedHTML;
    formattedName: string | WrappedHTML;
    drillDownFilterValue: string;
    y: number;
    color?: string;
    colorGuid?: string;
    colorValue?: string | number;
    label?: string | number | null | WrappedMarkdown | WrappedMarkup | WrappedHTML;
    custom?: object;
};
