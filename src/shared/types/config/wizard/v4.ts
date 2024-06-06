import type {
    AxisLabelFormatMode,
    ChartsConfigVersion,
    ColumnSettings,
    DatasetFieldCalcMode,
    NumberFormatType,
    NumberFormatUnit,
    ParameterDefaultValue,
    TableBarsSettings,
} from '../../index';
import type {AxisNullsMode, TableFieldBackgroundSettings} from '../../wizard';

export type V4ChartsConfig = {
    title?: string;
    colors: V4Color[];
    colorsConfig?: V4ColorsConfig;
    extraSettings: V4CommonSharedExtraSettings;
    filters: V4Filter[];
    geopointsConfig?: V4PointSizeConfig;
    hierarchies: V4HierarchyField[];
    labels: V4Label[];
    links: V4Link[];
    sort: V4Sort[];
    tooltips: V4Tooltip[];
    type: 'datalens';
    updates: V4Update[];
    visualization: V4Visualization;
    shapes: V4Shape[];
    shapesConfig?: V4ShapesConfig;
    version: ChartsConfigVersion.V4;
    datasetsIds: string[];
    datasetsPartialFields: V4ChartsConfigDatasetField[][];
    segments: V4Field[];
    chartType?: string;
};

type V4Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V4CommonSharedExtraSettings {
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
    navigatorSettings?: V4NavigatorSettings;
}

type V4NavigatorSettings = {
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

export type V4Filter = {
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
} & V4ClientOnlyFields;

export type V4Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V4ClientOnlyFields;

type V4Link = {
    id: string;
    fields: Record<string, V4LinkField>;
};

type V4LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V4Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V4Layer[];
    placeholders: V4Placeholder[];
};

type V4LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V4CommonPlaceholders = {
    colors: V4Color[];
    labels: V4Label[];
    tooltips: V4Tooltip[];
    filters: V4Filter[];
    sort: V4Sort[];
    shapes?: V4Shape[];
    colorsConfig?: V4ColorsConfig;
    geopointsConfig?: V4PointSizeConfig;
    shapesConfig?: V4ShapesConfig;
};

export type V4Layer = {
    id: string;
    commonPlaceholders: V4CommonPlaceholders;
    layerSettings: V4LayerSettings;
    placeholders: V4Placeholder[];
};

export type V4Placeholder = {
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
        nulls?: AxisNullsMode;
        holidays?: 'on' | 'off';
        axisFormatMode?: AxisLabelFormatMode;
    };
    required?: boolean;
    capacity?: number;
    items: V4Field[];
};

export type V4Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V4Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V4ClientOnlyFields;

export type V4Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V4Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V4Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V4ClientOnlyFields;

export type V4Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V4Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V4Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V4HierarchyField = {
    data_type: string;
    fields: V4Field[];
    type: string;
};

type V4PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V4Field = {
    data_type: string;
    fields?: V4Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V4Formatting;
    format?: string;
    datasetId: string;
    dateMode?: string;
    source?: string;
    datasetName?: string;
    hideLabelMode?: string;
    calc_mode: DatasetFieldCalcMode;
    default_value?: ParameterDefaultValue;
    barsSettings?: TableBarsSettings;
    backgroundSettings?: TableFieldBackgroundSettings;
    columnSettings?: ColumnSettings;
} & V4ClientOnlyFields;

export type V4ColorsConfig = {
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

type V4ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V4ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

type V4ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
