import type {
    GradientNullMode,
    MapCenterModes,
    MarkupType,
    MetricFontSettings,
    WidgetSizeType,
    ZoomModes,
} from '../../..';
import type {ColorMode} from '../../../constants';
import type {DatasetFieldCalcMode, ParameterDefaultValue} from '../../dataset';
import type {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    ChartsConfigVersion,
    ColumnSettings,
    HintSettings,
    IndicatorTitleMode,
    LabelsPositions,
    NumberFormatType,
    NumberFormatUnit,
    TableBarsSettings,
    TableFieldBackgroundSettings,
    TableSubTotalsSettings,
} from '../../wizard';

export type V13ChartsConfig = {
    title?: string;
    colors: V13Color[];
    colorsConfig?: V13ColorsConfig;
    extraSettings: V13CommonSharedExtraSettings | undefined;
    filters: V13Filter[];
    geopointsConfig?: V13PointSizeConfig;
    hierarchies: V13HierarchyField[];
    labels: V13Label[];
    links: V13Link[];
    sort: V13Sort[];
    tooltips: V13Tooltip[];
    tooltipConfig?: V13TooltipConfig;
    type: 'datalens';
    updates: V13Update[];
    visualization: V13Visualization;
    shapes: V13Shape[];
    shapesConfig?: V13ShapesConfig;
    version: ChartsConfigVersion.V13;
    datasetsIds: string[];
    datasetsPartialFields: V13ChartsConfigDatasetField[][];
    segments: V13Field[];
    chartType?: string;
};

export type V13Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export type V13CommonSharedExtraSettings = {
    title?: string;
    titleMode?: 'show' | 'hide';
    indicatorTitleMode?: IndicatorTitleMode;
    legendMode?: 'show' | 'hide';
    tooltip?: 'show' | 'hide';
    tooltipSum?: 'on' | 'off';
    limit?: number;
    pagination?: 'on' | 'off';
    navigatorMode?: string;
    navigatorSeriesName?: string;
    totals?: 'on' | 'off';
    pivotFallback?: 'on' | 'off';
    pivotInlineSort?: 'on' | 'off';
    stacking?: 'on' | 'off';
    overlap?: 'on' | 'off';
    feed?: string;
    navigatorSettings?: V13NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
    pinnedColumns?: number;
    size?: WidgetSizeType;
    zoomMode?: ZoomModes;
    zoomValue?: number | null;
    mapCenterMode?: MapCenterModes;
    mapCenterValue?: string | null;
    preserveWhiteSpace?: boolean;
} & MetricFontSettings;

export type V13NavigatorSettings = {
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

export type V13Filter = {
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
} & V13ClientOnlyFields;

export type V13Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V13ClientOnlyFields;

export type V13Link = {
    id: string;
    fields: Record<string, V13LinkField>;
};

export type V13LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V13Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V13Layer[];
    placeholders: V13Placeholder[];
};

export type V13LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V13CommonPlaceholders = {
    colors: V13Color[];
    labels: V13Label[];
    tooltips: V13Tooltip[];
    filters: V13Filter[];
    sort: V13Sort[];
    shapes?: V13Shape[];
    colorsConfig?: V13ColorsConfig;
    geopointsConfig?: V13PointSizeConfig;
    shapesConfig?: V13ShapesConfig;
    tooltipConfig?: V13TooltipConfig;
};

export type V13Layer = {
    id: string;
    commonPlaceholders: V13CommonPlaceholders;
    layerSettings: V13LayerSettings;
    placeholders: V13Placeholder[];
};

export type V13PlaceholderSettings = {
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
    /* Whether axis, including axis title, line, ticks and labels, should be visible
     * @default 'show'
     **/
    axisVisibility?: 'show' | 'hide';
};

export type V13Placeholder = {
    id: string;
    settings?: V13PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V13Field[];
};

export type V13Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V13Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V13ClientOnlyFields;

export type V13Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V13ClientOnlyFields;

export type V13Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V13Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V13ClientOnlyFields;

export type V13Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V13Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V13Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V13HierarchyField = {
    data_type: string;
    fields: V13Field[];
    type: string;
};

export type V13PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V13Field = {
    data_type: string;
    fields?: V13Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V13Formatting;
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
    hintSettings?: HintSettings;
} & V13ClientOnlyFields;

export type V13ColorsConfig = {
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
    nullMode?: GradientNullMode;
};

export type V13ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V13TooltipConfig = {
    color?: 'on' | 'off';
    fieldTitle?: 'on' | 'off';
};

export type V13ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V13ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
    markupType?: MarkupType;
};
