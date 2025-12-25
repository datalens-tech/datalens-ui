import type {DatasetFieldCalcMode, ParameterDefaultValue} from '../../dataset';
import type {NumberFormatType, NumberFormatUnit} from '../../formatting';
import type {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    ChartsConfigVersion,
    ColumnSettings,
    TableBarsSettings,
    TableFieldBackgroundSettings,
    TableSubTotalsSettings,
} from '../../wizard';

export type V7ChartsConfig = {
    title?: string;
    colors: V7Color[];
    colorsConfig?: V7ColorsConfig;
    extraSettings: V7CommonSharedExtraSettings;
    filters: V7Filter[];
    geopointsConfig?: V7PointSizeConfig;
    hierarchies: V7HierarchyField[];
    labels: V7Label[];
    links: V7Link[];
    sort: V7Sort[];
    tooltips: V7Tooltip[];
    type: 'datalens';
    updates: V7Update[];
    visualization: V7Visualization;
    shapes: V7Shape[];
    shapesConfig?: V7ShapesConfig;
    version: ChartsConfigVersion.V7;
    datasetsIds: string[];
    datasetsPartialFields: V7ChartsConfigDatasetField[][];
    segments: V7Field[];
    chartType?: string;
};

export type V7Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V7CommonSharedExtraSettings {
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
    navigatorSettings?: V7NavigatorSettings;
}

export type V7NavigatorSettings = {
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

export type V7Filter = {
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
} & V7ClientOnlyFields;

export type V7Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V7ClientOnlyFields;

export type V7Link = {
    id: string;
    fields: Record<string, V7LinkField>;
};

export type V7LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V7Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V7Layer[];
    placeholders: V7Placeholder[];
};

export type V7LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V7CommonPlaceholders = {
    colors: V7Color[];
    labels: V7Label[];
    tooltips: V7Tooltip[];
    filters: V7Filter[];
    sort: V7Sort[];
    shapes?: V7Shape[];
    colorsConfig?: V7ColorsConfig;
    geopointsConfig?: V7PointSizeConfig;
    shapesConfig?: V7ShapesConfig;
};

export type V7Layer = {
    id: string;
    commonPlaceholders: V7CommonPlaceholders;
    layerSettings: V7LayerSettings;
    placeholders: V7Placeholder[];
};

export type V7Placeholder = {
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
        axisModeMap?: Record<string, AxisMode>;
    };
    required?: boolean;
    capacity?: number;
    items: V7Field[];
};

export type V7Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V7Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V7ClientOnlyFields;

export type V7Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V7Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V7Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V7ClientOnlyFields;

export type V7Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V7Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V7Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V7HierarchyField = {
    data_type: string;
    fields: V7Field[];
    type: string;
};

export type V7PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V7Field = {
    data_type: string;
    fields?: V7Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V7Formatting;
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
} & V7ClientOnlyFields;

export type V7ColorsConfig = {
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

export type V7ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V7ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V7ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
