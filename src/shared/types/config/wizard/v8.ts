import type {DatasetFieldCalcMode, ParameterDefaultValue} from '../../dataset';
import type {NumberFormatType, NumberFormatUnit} from '../../formatting';
import type {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    ChartsConfigVersion,
    ColumnSettings,
    LabelsPositions,
    TableBarsSettings,
    TableFieldBackgroundSettings,
} from '../../wizard';
import type {TableSubTotalsSettings} from '../../wizard/sub-totals';

export type V8ChartsConfig = {
    title?: string;
    colors: V8Color[];
    colorsConfig?: V8ColorsConfig;
    extraSettings: V8CommonSharedExtraSettings | undefined;
    filters: V8Filter[];
    geopointsConfig?: V8PointSizeConfig;
    hierarchies: V8HierarchyField[];
    labels: V8Label[];
    links: V8Link[];
    sort: V8Sort[];
    tooltips: V8Tooltip[];
    type: 'datalens';
    updates: V8Update[];
    visualization: V8Visualization;
    shapes: V8Shape[];
    shapesConfig?: V8ShapesConfig;
    version: ChartsConfigVersion.V8;
    datasetsIds: string[];
    datasetsPartialFields: V8ChartsConfigDatasetField[][];
    segments: V8Field[];
    chartType?: string;
};

export type V8Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V8CommonSharedExtraSettings {
    title?: string;
    titleMode?: 'show' | 'hide';
    legendMode?: 'show' | 'hide';
    metricFontSize?: string;
    metricFontColor?: string;
    tooltipSum?: 'on' | 'off';
    limit?: number;
    pagination?: 'on' | 'off';
    navigatorMode?: string;
    navigatorSeriesName?: string;
    totals?: 'on' | 'off';
    pivotFallback?: 'on' | 'off';
    overlap?: 'on' | 'off';
    feed?: string;
    navigatorSettings?: V8NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
}

export type V8NavigatorSettings = {
    navigatorMode: string;
    isNavigatorAvailable: boolean;
    selectedLines: string[];
    linesMode: string;
    periodSettings: {
        type: string;
        value: string;
        period: string;
    };
};

export type V8Filter = {
    guid: string;
    datasetId: string;
    disabled?: string;
    filter: {
        operation: {
            code: string;
        };
        value?: string | string[];
    };
    type: string;
    title: string;
    calc_mode: DatasetFieldCalcMode;
} & V8ClientOnlyFields;

export type V8Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V8ClientOnlyFields;

export type V8Link = {
    id: string;
    fields: Record<string, V8LinkField>;
};

export type V8LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V8Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V8Layer[];
    placeholders: V8Placeholder[];
};

export type V8LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V8CommonPlaceholders = {
    colors: V8Color[];
    labels: V8Label[];
    tooltips: V8Tooltip[];
    filters: V8Filter[];
    sort: V8Sort[];
    shapes?: V8Shape[];
    colorsConfig?: V8ColorsConfig;
    geopointsConfig?: V8PointSizeConfig;
    shapesConfig?: V8ShapesConfig;
};

export type V8Layer = {
    id: string;
    commonPlaceholders: V8CommonPlaceholders;
    layerSettings: V8LayerSettings;
    placeholders: V8Placeholder[];
};

export type V8PlaceholderSettings = {
    groupping?: 'disabled' | 'off';
    autoscale?: boolean;
    scale?: 'auto' | 'manual';
    scaleValue?: '0-max' | [string, string];
    title?: 'auto' | 'manual' | 'off';
    titleValue?: 'string';
    type?: 'logarithmic';
    grid?: 'on' | 'off';
    gridStep?: 'manual';
    gridStepValue?: number;
    hideLabels?: 'yes' | 'no';
    labelsView?: 'horizontal' | 'vertical' | 'angle';
    nulls?: AxisNullsMode;
    holidays?: 'on' | 'off';
    axisFormatMode?: AxisLabelFormatMode;
    axisModeMap?: Record<string, AxisMode>;
};

export type V8Placeholder = {
    id: string;
    settings?: V8PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V8Field[];
};

export type V8Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V8Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V8ClientOnlyFields;

export type V8Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V8Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V8Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V8ClientOnlyFields;

export type V8Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V8Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V8Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V8HierarchyField = {
    data_type: string;
    fields: V8Field[];
    type: string;
};

export type V8PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V8Field = {
    data_type: string;
    fields?: V8Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V8Formatting;
    format?: string;
    datasetId: string;
    source?: string;
    datasetName?: string;
    hideLabelMode?: string;
    calc_mode: DatasetFieldCalcMode;
    default_value?: ParameterDefaultValue;
    barsSettings?: TableBarsSettings;
    subTotalsSettings?: TableSubTotalsSettings;
    backgroundSettings?: TableFieldBackgroundSettings;
    columnSettings?: ColumnSettings;
} & V8ClientOnlyFields;

export type V8ColorsConfig = {
    thresholdsMode?: string;
    leftThreshold?: string;
    middleThreshold?: string;
    rightThreshold?: string;
    gradientPalette?: string;
    gradientMode?: string;
    polygonBorders?: string;
    reversed?: boolean;
    fieldGuid?: string;
    mountedColors?: Record<string, string>;
    coloredByMeasure?: boolean;
    palette?: string;
};

export type V8ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V8ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V8ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
