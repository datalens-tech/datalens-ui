import type {
    AxisLabelFormatMode,
    AxisMode,
    ChartsConfigVersion,
    ColumnSettings,
    DatasetFieldCalcMode,
    NumberFormatType,
    NumberFormatUnit,
    ParameterDefaultValue,
    TableBarsSettings,
} from '../../index';
import type {TableFieldBackgroundSettings} from '../../wizard';

export type V5ChartsConfig = {
    title?: string;
    colors: V5Color[];
    colorsConfig?: V5ColorsConfig;
    extraSettings: V5CommonSharedExtraSettings;
    filters: V5Filter[];
    geopointsConfig?: V5PointSizeConfig;
    hierarchies: V5HierarchyField[];
    labels: V5Label[];
    links: V5Link[];
    sort: V5Sort[];
    tooltips: V5Tooltip[];
    type: 'datalens';
    updates: V5Update[];
    visualization: V5Visualization;
    shapes: V5Shape[];
    shapesConfig?: V5ShapesConfig;
    version: ChartsConfigVersion.V5;
    datasetsIds: string[];
    datasetsPartialFields: V5ChartsConfigDatasetField[][];
    segments: V5Field[];
    chartType?: string;
};

type V5Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V5CommonSharedExtraSettings {
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
    navigatorSettings?: V5NavigatorSettings;
}

type V5NavigatorSettings = {
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

export type V5Filter = {
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
} & V5ClientOnlyFields;

export type V5Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V5ClientOnlyFields;

type V5Link = {
    id: string;
    fields: Record<string, V5LinkField>;
};

type V5LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V5Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V5Layer[];
    placeholders: V5Placeholder[];
};

type V5LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V5CommonPlaceholders = {
    colors: V5Color[];
    labels: V5Label[];
    tooltips: V5Tooltip[];
    filters: V5Filter[];
    sort: V5Sort[];
    shapes?: V5Shape[];
    colorsConfig?: V5ColorsConfig;
    geopointsConfig?: V5PointSizeConfig;
    shapesConfig?: V5ShapesConfig;
};

export type V5Layer = {
    id: string;
    commonPlaceholders: V5CommonPlaceholders;
    layerSettings: V5LayerSettings;
    placeholders: V5Placeholder[];
};

export type V5Placeholder = {
    id: string;
    settings?: {
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
        nulls?: 'ignore' | 'connect' | 'as-0';
        holidays?: 'on' | 'off';
        axisFormatMode?: AxisLabelFormatMode;
        axisMode?: AxisMode;
    };
    required?: boolean;
    capacity?: number;
    items: V5Field[];
};

export type V5Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V5Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V5ClientOnlyFields;

export type V5Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V5Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V5Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V5ClientOnlyFields;

export type V5Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V5Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V5Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V5HierarchyField = {
    data_type: string;
    fields: V5Field[];
    type: string;
};

type V5PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V5Field = {
    data_type: string;
    fields?: V5Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V5Formatting;
    format?: string;
    datasetId: string;
    source?: string;
    datasetName?: string;
    hideLabelMode?: string;
    calc_mode: DatasetFieldCalcMode;
    default_value?: ParameterDefaultValue;
    barsSettings?: TableBarsSettings;
    backgroundSettings?: TableFieldBackgroundSettings;
    columnSettings?: ColumnSettings;
} & V5ClientOnlyFields;

export type V5ColorsConfig = {
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

type V5ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V5ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

type V5ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
