import type {
    GradientNullMode,
    MapCenterModes,
    MarkupType,
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

export type V12ChartsConfig = {
    title?: string;
    colors: V12Color[];
    colorsConfig?: V12ColorsConfig;
    extraSettings: V12CommonSharedExtraSettings | undefined;
    filters: V12Filter[];
    geopointsConfig?: V12PointSizeConfig;
    hierarchies: V12HierarchyField[];
    labels: V12Label[];
    links: V12Link[];
    sort: V12Sort[];
    tooltips: V12Tooltip[];
    tooltipConfig?: V12TooltipConfig;
    type: 'datalens';
    updates: V12Update[];
    visualization: V12Visualization;
    shapes: V12Shape[];
    shapesConfig?: V12ShapesConfig;
    version: ChartsConfigVersion.V12;
    datasetsIds: string[];
    datasetsPartialFields: V12ChartsConfigDatasetField[][];
    segments: V12Field[];
    chartType?: string;
};

export type V12Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V12CommonSharedExtraSettings {
    title?: string;
    titleMode?: 'show' | 'hide';
    indicatorTitleMode?: IndicatorTitleMode;
    legendMode?: 'show' | 'hide';
    metricFontSize?: string;
    metricFontColor?: string;
    metricFontColorPalette?: string;
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
    navigatorSettings?: V12NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
    pinnedColumns?: number;
    size?: WidgetSizeType;
    zoomMode?: ZoomModes;
    zoomValue?: number | null;
    mapCenterMode?: MapCenterModes;
    mapCenterValue?: string | null;
    preserveWhiteSpace?: boolean;
}

export type V12NavigatorSettings = {
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

export type V12Filter = {
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
} & V12ClientOnlyFields;

export type V12Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V12ClientOnlyFields;

export type V12Link = {
    id: string;
    fields: Record<string, V12LinkField>;
};

export type V12LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V12Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V12Layer[];
    placeholders: V12Placeholder[];
};

export type V12LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V12CommonPlaceholders = {
    colors: V12Color[];
    labels: V12Label[];
    tooltips: V12Tooltip[];
    filters: V12Filter[];
    sort: V12Sort[];
    shapes?: V12Shape[];
    colorsConfig?: V12ColorsConfig;
    geopointsConfig?: V12PointSizeConfig;
    shapesConfig?: V12ShapesConfig;
    tooltipConfig?: V12TooltipConfig;
};

export type V12Layer = {
    id: string;
    commonPlaceholders: V12CommonPlaceholders;
    layerSettings: V12LayerSettings;
    placeholders: V12Placeholder[];
};

export type V12PlaceholderSettings = {
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

export type V12Placeholder = {
    id: string;
    settings?: V12PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V12Field[];
};

export type V12Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V12Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V12ClientOnlyFields;

export type V12Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V12ClientOnlyFields;

export type V12Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V12Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V12ClientOnlyFields;

export type V12Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V12Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V12Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V12HierarchyField = {
    data_type: string;
    fields: V12Field[];
    type: string;
};

export type V12PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V12Field = {
    data_type: string;
    fields?: V12Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V12Formatting;
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
} & V12ClientOnlyFields;

export type V12ColorsConfig = {
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

export type V12ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V12TooltipConfig = {
    color?: 'on' | 'off';
    fieldTitle?: 'on' | 'off';
};

export type V12ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V12ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
    markupType?: MarkupType;
};
