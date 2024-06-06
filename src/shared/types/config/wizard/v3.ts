import type {
    AxisNullsMode,
    ChartsConfigVersion,
    DatasetFieldCalcMode,
    ParameterDefaultValue,
} from '../../index';

export type V3ChartsConfig = {
    title?: string;
    colors: V3Color[];
    colorsConfig: V3ColorsConfig;
    extraSettings: V3CommonSharedExtraSettings;
    filters: V3Filter[];
    geopointsConfig?: V3PointSizeConfig;
    hierarchies: V3HierarchyField[];
    labels: V3Label[];
    links: V3Link[];
    sort: V3Sort[];
    tooltips: V3Tooltip[];
    type: 'datalens';
    updates: V3Update[];
    visualization: V3Visualization;
    shapes: V3Shape[];
    shapesConfig?: V3ShapesConfig;
    version: ChartsConfigVersion.V3;
    datasetsIds: string[];
    datasetsPartialFields: V3ChartsConfigDatasetField[][];
};

type V3Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

interface V3CommonSharedExtraSettings {
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
    navigatorSettings?: V3NavigatorSettings;
}

type V3NavigatorSettings = {
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

export type V3Filter = {
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
} & V3ClientOnlyFields;

type V3Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    default_value?: ParameterDefaultValue;
} & V3ClientOnlyFields;

type V3Link = {
    id: string;
    fields: Record<string, V3LinkField>;
};

type V3LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

type V3Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V3Layer[];
    placeholders: V3Placeholder[];
};

type V3LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V3CommonPlaceholders = {
    colors: V3Color[];
    labels: V3Label[];
    tooltips: V3Tooltip[];
    filters: V3Filter[];
    sort: V3Sort[];
    colorsConfig: V3ColorsConfig;
    geopointsConfig?: V3PointSizeConfig;
};

export type V3Layer = {
    id: string;
    commonPlaceholders: V3CommonPlaceholders;
    layerSettings: V3LayerSettings;
    placeholders: V3Placeholder[];
};

type V3Placeholder = {
    id: string;
    settings?: {
        groupping?: 'disabled' | 'off';
        autoscale?: boolean;
        scale?: 'auto' | 'manual';
        scaleValue?: '0-max' | [string, string];
        title?: 'auto' | 'manual';
        titleValue?: 'string';
        type?: 'logarithmic';
        grid?: 'on' | 'off';
        gridStep?: 'manual';
        gridStepValue?: number;
        hideLabels?: 'yes' | 'no';
        labelsView?: 'horizontal' | 'vertical' | 'angle';
        nulls?: AxisNullsMode;
    };
    items: V3Field[];
};

type V3Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V3Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V3ClientOnlyFields;

type V3Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

type V3Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V3Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V3ClientOnlyFields;

export type V3Formatting = {
    format?: 'number' | 'percent';
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: 'auto' | 'k' | 'm' | 'b' | 't';
    precision?: number;
};

export type V3Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V3Formatting;
    format?: string;
    labelMode?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V3HierarchyField = {
    data_type: string;
    fields: V3Field[];
    type: string;
};

type V3PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V3Field = {
    data_type: string;
    fields?: V3Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V3Formatting;
    format?: string;
    labelMode?: string;
    datasetId: string;
    dateMode?: string;
    source?: string;
    datasetName?: string;
    hideLabelMode?: string;
    calc_mode: DatasetFieldCalcMode;
    default_value?: ParameterDefaultValue;
} & V3ClientOnlyFields;

type V3ColorsConfig = {
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

type V3ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V3ChartsConfigDatasetField = {
    guid: string;
    title: string;
    calc_mode?: DatasetFieldCalcMode;
};

type V3ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
