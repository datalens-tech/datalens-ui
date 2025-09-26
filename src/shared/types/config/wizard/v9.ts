import type {ColorMode} from '../../../constants';
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
    TableSubTotalsSettings,
} from '../../wizard';

export type V9ChartsConfig = {
    title?: string;
    colors: V9Color[];
    colorsConfig?: V9ColorsConfig;
    extraSettings: V9CommonSharedExtraSettings | undefined;
    filters: V9Filter[];
    geopointsConfig?: V9PointSizeConfig;
    hierarchies: V9HierarchyField[];
    labels: V9Label[];
    links: V9Link[];
    sort: V9Sort[];
    tooltips: V9Tooltip[];
    type: 'datalens';
    updates: V9Update[];
    visualization: V9Visualization;
    shapes: V9Shape[];
    shapesConfig?: V9ShapesConfig;
    version: ChartsConfigVersion.V9;
    datasetsIds: string[];
    datasetsPartialFields: V9ChartsConfigDatasetField[][];
    segments: V9Field[];
    chartType?: string;
};

export type V9Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V9CommonSharedExtraSettings {
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
    navigatorSettings?: V9NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
}

export type V9NavigatorSettings = {
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

export type V9Filter = {
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
} & V9ClientOnlyFields;

export type V9Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V9ClientOnlyFields;

export type V9Link = {
    id: string;
    fields: Record<string, V9LinkField>;
};

export type V9LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V9Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V9Layer[];
    placeholders: V9Placeholder[];
};

export type V9LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V9CommonPlaceholders = {
    colors: V9Color[];
    labels: V9Label[];
    tooltips: V9Tooltip[];
    filters: V9Filter[];
    sort: V9Sort[];
    shapes?: V9Shape[];
    colorsConfig?: V9ColorsConfig;
    geopointsConfig?: V9PointSizeConfig;
    shapesConfig?: V9ShapesConfig;
};

export type V9Layer = {
    id: string;
    commonPlaceholders: V9CommonPlaceholders;
    layerSettings: V9LayerSettings;
    placeholders: V9Placeholder[];
};

export type V9PlaceholderSettings = {
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
    disableAxisMode?: boolean;
};

export type V9Placeholder = {
    id: string;
    settings?: V9PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V9Field[];
};

export type V9Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V9Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V9ClientOnlyFields;

export type V9Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V9Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V9Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V9ClientOnlyFields;

export type V9Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V9Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V9Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V9HierarchyField = {
    data_type: string;
    fields: V9Field[];
    type: string;
};

export type V9PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V9Field = {
    data_type: string;
    fields?: V9Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V9Formatting;
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
} & V9ClientOnlyFields;

export type V9ColorsConfig = {
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
    colorMode?: ColorMode;
};

export type V9ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V9ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V9ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
