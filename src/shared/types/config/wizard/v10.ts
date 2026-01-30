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
    LabelsPositions,
    TableBarsSettings,
    TableFieldBackgroundSettings,
    TableSubTotalsSettings,
} from '../../wizard';

export type V10ChartsConfig = {
    title?: string;
    colors: V10Color[];
    colorsConfig?: V10ColorsConfig;
    extraSettings: V10CommonSharedExtraSettings | undefined;
    filters: V10Filter[];
    geopointsConfig?: V10PointSizeConfig;
    hierarchies: V10HierarchyField[];
    labels: V10Label[];
    links: V10Link[];
    sort: V10Sort[];
    tooltips: V10Tooltip[];
    type: 'datalens';
    updates: V10Update[];
    visualization: V10Visualization;
    shapes: V10Shape[];
    shapesConfig?: V10ShapesConfig;
    version: ChartsConfigVersion.V10;
    datasetsIds: string[];
    datasetsPartialFields: V10ChartsConfigDatasetField[][];
    segments: V10Field[];
    chartType?: string;
};

export type V10Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

export interface V10CommonSharedExtraSettings {
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
    navigatorSettings?: V10NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
    pinnedColumns?: number;
}

export type V10NavigatorSettings = {
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

export type V10Filter = {
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
} & V10ClientOnlyFields;

export type V10Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V10ClientOnlyFields;

export type V10Link = {
    id: string;
    fields: Record<string, V10LinkField>;
};

export type V10LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

export type V10Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V10Layer[];
    placeholders: V10Placeholder[];
};

export type V10LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V10CommonPlaceholders = {
    colors: V10Color[];
    labels: V10Label[];
    tooltips: V10Tooltip[];
    filters: V10Filter[];
    sort: V10Sort[];
    shapes?: V10Shape[];
    colorsConfig?: V10ColorsConfig;
    geopointsConfig?: V10PointSizeConfig;
    shapesConfig?: V10ShapesConfig;
};

export type V10Layer = {
    id: string;
    commonPlaceholders: V10CommonPlaceholders;
    layerSettings: V10LayerSettings;
    placeholders: V10Placeholder[];
};

export type V10PlaceholderSettings = {
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

export type V10Placeholder = {
    id: string;
    settings?: V10PlaceholderSettings;
    required?: boolean;
    capacity?: number;
    items: V10Field[];
};

export type V10Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V10Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V10ClientOnlyFields;

export type V10Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V10Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V10Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V10ClientOnlyFields;

export type V10Formatting = {
    format?: NumberFormatType;
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: NumberFormatUnit;
    precision?: number;
    labelMode?: string;
};

export type V10Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V10Formatting;
    format?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V10HierarchyField = {
    data_type: string;
    fields: V10Field[];
    type: string;
};

export type V10PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V10Field = {
    data_type: string;
    fields?: V10Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V10Formatting;
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
} & V10ClientOnlyFields;

export type V10ColorsConfig = {
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

export type V10ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V10ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

export type V10ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
