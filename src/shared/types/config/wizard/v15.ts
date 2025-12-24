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

export type V15ChartsConfig = {
    title?: string;
    colors: V15Color[];
    colorsConfig?: V15ColorsConfig;
    extraSettings: V15CommonSharedExtraSettings | undefined;
    filters: V15Filter[];
    geopointsConfig?: V15PointSizeConfig;
    hierarchies: V15HierarchyField[];
    labels: V15Label[];
    links: V15Link[];
    sort: V15Sort[];
    tooltips: V15Tooltip[];
    tooltipConfig?: V15TooltipConfig;
    type: 'datalens';
    updates: V15Update[];
    visualization: V15Visualization;
    shapes: V15Shape[];
    shapesConfig?: V15ShapesConfig;
    version: ChartsConfigVersion.V15;
    datasetsIds: string[];
    datasetsPartialFields: V15ChartsConfigDatasetField[][];
    segments: V15Field[];
    chartType?: string;
};

export type V15Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export type V15CommonSharedExtraSettings = {
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
    navigatorSettings?: V15NavigatorSettings;
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

export type V15NavigatorSettings = {
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

export type V15Filter = {
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
} & V15ClientOnlyFields;

export type V15Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V15ClientOnlyFields;

export type V15Link = {
    id: string;
    fields: Record<string, V15LinkField>;
};

export type V15LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V15Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V15Layer[];
    placeholders: V15Placeholder[];
};

export type V15LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V15CommonPlaceholders = {
    colors: V15Color[];
    labels: V15Label[];
    tooltips: V15Tooltip[];
    filters: V15Filter[];
    sort: V15Sort[];
    shapes?: V15Shape[];
    colorsConfig?: V15ColorsConfig;
    geopointsConfig?: V15PointSizeConfig;
    shapesConfig?: V15ShapesConfig;
    tooltipConfig?: V15TooltipConfig;
};

export type V15Layer = {
    id: string;
    commonPlaceholders: V15CommonPlaceholders;
    layerSettings: V15LayerSettings;
    placeholders: V15Placeholder[];
};

export type V15PlaceholderSettings = {
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
    axisLabelFormating?: V15Formatting;
    axisLabelDateFormat?: string;
    axisFormatMode?: AxisLabelFormatMode;
    axisModeMap?: Record<string, AxisMode>;
    disableAxisMode?: boolean;
    /* Whether axis, including axis title, line, ticks and labels, should be visible
     * @default 'show'
     **/
    axisVisibility?: 'show' | 'hide';
};

export type V15Placeholder = {
    id: string;
    settings?: V15PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V15Field[];
};

export type V15Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V15Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V15ClientOnlyFields;

export type V15Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V15ClientOnlyFields;

export type V15Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V15Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V15ClientOnlyFields;

export type V15Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V15Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V15Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V15HierarchyField = {
    data_type: string;
    fields: V15Field[];
    type: string;
};

export type V15PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V15Field = {
    data_type: string;
    fields?: V15Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V15Formatting;
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
} & V15ClientOnlyFields;

export type V15ColorsConfig = {
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

export type V15ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V15TooltipConfig = {
    color?: 'on' | 'off';
    fieldTitle?: 'on' | 'off';
};

export type V15ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V15ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
    markupType?: MarkupType;
};
