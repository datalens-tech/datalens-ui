import type {WidgetSizeType} from '../../..';
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

export type V11ChartsConfig = {
    title?: string;
    colors: V11Color[];
    colorsConfig?: V11ColorsConfig;
    extraSettings: V11CommonSharedExtraSettings | undefined;
    filters: V11Filter[];
    geopointsConfig?: V11PointSizeConfig;
    hierarchies: V11HierarchyField[];
    labels: V11Label[];
    links: V11Link[];
    sort: V11Sort[];
    tooltips: V11Tooltip[];
    tooltipConfig?: V11TooltipConfig;
    type: 'datalens';
    updates: V11Update[];
    visualization: V11Visualization;
    shapes: V11Shape[];
    shapesConfig?: V11ShapesConfig;
    version: ChartsConfigVersion.V11;
    datasetsIds: string[];
    datasetsPartialFields: V11ChartsConfigDatasetField[][];
    segments: V11Field[];
    chartType?: string;
};

export type V11Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V11CommonSharedExtraSettings {
    title?: string;
    titleMode?: 'show' | 'hide';
    indicatorTitleMode?: IndicatorTitleMode;
    legendMode?: 'show' | 'hide';
    metricFontSize?: string;
    metricFontColor?: string;
    tooltip?: 'show' | 'hide';
    tooltipSum?: 'on' | 'off';
    limit?: number;
    pagination?: 'on' | 'off';
    navigatorMode?: string;
    navigatorSeriesName?: string;
    totals?: 'on' | 'off';
    pivotFallback?: 'on' | 'off';
    pivotInlineSort?: 'on' | 'off';
    overlap?: 'on' | 'off';
    feed?: string;
    navigatorSettings?: V11NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
    pinnedColumns?: number;
    size?: WidgetSizeType;
}

export type V11NavigatorSettings = {
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

export type V11Filter = {
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
} & V11ClientOnlyFields;

export type V11Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V11ClientOnlyFields;

export type V11Link = {
    id: string;
    fields: Record<string, V11LinkField>;
};

export type V11LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V11Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V11Layer[];
    placeholders: V11Placeholder[];
};

export type V11LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V11CommonPlaceholders = {
    colors: V11Color[];
    labels: V11Label[];
    tooltips: V11Tooltip[];
    filters: V11Filter[];
    sort: V11Sort[];
    shapes?: V11Shape[];
    colorsConfig?: V11ColorsConfig;
    geopointsConfig?: V11PointSizeConfig;
    shapesConfig?: V11ShapesConfig;
    tooltipConfig?: V11TooltipConfig;
};

export type V11Layer = {
    id: string;
    commonPlaceholders: V11CommonPlaceholders;
    layerSettings: V11LayerSettings;
    placeholders: V11Placeholder[];
};

export type V11PlaceholderSettings = {
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

export type V11Placeholder = {
    id: string;
    settings?: V11PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V11Field[];
};

export type V11Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V11Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V11ClientOnlyFields;

export type V11Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V11ClientOnlyFields;

export type V11Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V11Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V11ClientOnlyFields;

export type V11Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V11Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V11Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V11HierarchyField = {
    data_type: string;
    fields: V11Field[];
    type: string;
};

export type V11PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V11Field = {
    data_type: string;
    fields?: V11Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V11Formatting;
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
} & V11ClientOnlyFields;

export type V11ColorsConfig = {
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

export type V11ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V11TooltipConfig = {
    color?: 'on' | 'off';
    fieldTitle?: 'on' | 'off';
};

export type V11ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V11ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
    isMarkdown?: boolean;
};
