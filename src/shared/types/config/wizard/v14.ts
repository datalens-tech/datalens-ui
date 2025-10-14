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
import type {NumberFormatType, NumberFormatUnit} from '../../formatting';
import type {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    ChartsConfigVersion,
    ColumnSettings,
    HintSettings,
    IndicatorTitleMode,
    LabelsPositions,
    TableBarsSettings,
    TableFieldBackgroundSettings,
    TableSubTotalsSettings,
} from '../../wizard';

export type V14ChartsConfig = {
    title?: string;
    colors: V14Color[];
    colorsConfig?: V14ColorsConfig;
    extraSettings: V14CommonSharedExtraSettings | undefined;
    filters: V14Filter[];
    geopointsConfig?: V14PointSizeConfig;
    hierarchies: V14HierarchyField[];
    labels: V14Label[];
    links: V14Link[];
    sort: V14Sort[];
    tooltips: V14Tooltip[];
    tooltipConfig?: V14TooltipConfig;
    type: 'datalens';
    updates: V14Update[];
    visualization: V14Visualization;
    shapes: V14Shape[];
    shapesConfig?: V14ShapesConfig;
    version: ChartsConfigVersion.V14;
    datasetsIds: string[];
    datasetsPartialFields: V14ChartsConfigDatasetField[][];
    segments: V14Field[];
    chartType?: string;
};

export type V14Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export type V14CommonSharedExtraSettings = {
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
    navigatorSettings?: V14NavigatorSettings;
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

export type V14NavigatorSettings = {
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

export type V14Filter = {
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
} & V14ClientOnlyFields;

export type V14Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V14ClientOnlyFields;

export type V14Link = {
    id: string;
    fields: Record<string, V14LinkField>;
};

export type V14LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V14Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V14Layer[];
    placeholders: V14Placeholder[];
};

export type V14LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V14CommonPlaceholders = {
    colors: V14Color[];
    labels: V14Label[];
    tooltips: V14Tooltip[];
    filters: V14Filter[];
    sort: V14Sort[];
    shapes?: V14Shape[];
    colorsConfig?: V14ColorsConfig;
    geopointsConfig?: V14PointSizeConfig;
    shapesConfig?: V14ShapesConfig;
    tooltipConfig?: V14TooltipConfig;
};

export type V14Layer = {
    id: string;
    commonPlaceholders: V14CommonPlaceholders;
    layerSettings: V14LayerSettings;
    placeholders: V14Placeholder[];
};

export type V14PlaceholderSettings = {
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
    axisLabelFormating?: V14Formatting;
    axisLabelDateFormat?: string;
    axisFormatMode?: AxisLabelFormatMode;
    axisModeMap?: Record<string, AxisMode>;
    disableAxisMode?: boolean;
    /* Whether axis, including axis title, line, ticks and labels, should be visible
     * @default 'show'
     **/
    axisVisibility?: 'show' | 'hide';
};

export type V14Placeholder = {
    id: string;
    settings?: V14PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V14Field[];
};

export type V14Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V14Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V14ClientOnlyFields;

export type V14Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V14ClientOnlyFields;

export type V14Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V14Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V14ClientOnlyFields;

export type V14Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V14Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V14Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V14HierarchyField = {
    data_type: string;
    fields: V14Field[];
    type: string;
};

export type V14PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V14Field = {
    data_type: string;
    fields?: V14Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V14Formatting;
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
    ui_settings?: string;
} & V14ClientOnlyFields;

export type V14ColorsConfig = {
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

export type V14ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V14TooltipConfig = {
    color?: 'on' | 'off';
    fieldTitle?: 'on' | 'off';
};

export type V14ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V14ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
    markupType?: MarkupType;
};
