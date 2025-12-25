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
} from '../../wizard';

export type V6ChartsConfig = {
    title?: string;
    colors: V6Color[];
    colorsConfig?: V6ColorsConfig;
    extraSettings: V6CommonSharedExtraSettings;
    filters: V6Filter[];
    geopointsConfig?: V6PointSizeConfig;
    hierarchies: V6HierarchyField[];
    labels: V6Label[];
    links: V6Link[];
    sort: V6Sort[];
    tooltips: V6Tooltip[];
    type: 'datalens';
    updates: V6Update[];
    visualization: V6Visualization;
    shapes: V6Shape[];
    shapesConfig?: V6ShapesConfig;
    version: ChartsConfigVersion.V6;
    datasetsIds: string[];
    datasetsPartialFields: V6ChartsConfigDatasetField[][];
    segments: V6Field[];
    chartType?: string;
};

export type V6Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V6CommonSharedExtraSettings {
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
    navigatorSettings?: V6NavigatorSettings;
}

export type V6NavigatorSettings = {
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

export type V6Filter = {
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
} & V6ClientOnlyFields;

export type V6Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V6ClientOnlyFields;

export type V6Link = {
    id: string;
    fields: Record<string, V6LinkField>;
};

export type V6LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V6Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V6Layer[];
    placeholders: V6Placeholder[];
};

export type V6LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V6CommonPlaceholders = {
    colors: V6Color[];
    labels: V6Label[];
    tooltips: V6Tooltip[];
    filters: V6Filter[];
    sort: V6Sort[];
    shapes?: V6Shape[];
    colorsConfig?: V6ColorsConfig;
    geopointsConfig?: V6PointSizeConfig;
    shapesConfig?: V6ShapesConfig;
};

export type V6Layer = {
    id: string;
    commonPlaceholders: V6CommonPlaceholders;
    layerSettings: V6LayerSettings;
    placeholders: V6Placeholder[];
};

export type V6Placeholder = {
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
        axisMode?: AxisMode;
    };
    required?: boolean;
    capacity?: number;
    items: V6Field[];
};

export type V6Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V6Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V6ClientOnlyFields;

export type V6Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V6Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V6Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V6ClientOnlyFields;

export type V6Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V6Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V6Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V6HierarchyField = {
    data_type: string;
    fields: V6Field[];
    type: string;
};

export type V6PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V6Field = {
    data_type: string;
    fields?: V6Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V6Formatting;
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
} & V6ClientOnlyFields;

export type V6ColorsConfig = {
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

export type V6ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V6ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V6ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
