import {
    DATASET_FIELD_TYPES,
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
} from '../../../../../../shared';
import {ApiV2RequestField} from '../../../../../../shared/types/bi-api/v2';
import type {ChartColorsConfig} from '../js/helpers/colors';

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
    labels: ServerLabel[];
    idToDataType: Record<string, DATASET_FIELD_TYPES>;

    visualizationId: string;
    shapes: ServerShape[];
    shapesConfig: ServerShapesConfig;
    segments: ServerField[];
    datasets: string[];
    layerChartMeta?: LayerChartMeta;
    usedColors?: (string | undefined)[];
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
    chartKitFormatting: boolean;
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
    name: string;
    formattedName: string;
    drillDownFilterValue: string;
    y: number;
    colorGuid: string;
    colorValue: string | number;
    label?: string | number | null;
    custom?: object;
};
