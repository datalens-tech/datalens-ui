import type {AxisNullsMode, ChartsConfigVersion, DatasetFieldCalcMode} from '../../index';

export type V2ChartsConfig = {
    title?: string;
    colors: V2Color[];
    colorsConfig: V2ColorsConfig;
    extraSettings: V2CommonSharedExtraSettings;
    filters: V2Filter[];
    geopointsConfig?: V2PointSizeConfig;
    hierarchies: V2HierarchyField[];
    labels: V2Label[];
    links: V2Link[];
    sort: V2Sort[];
    tooltips: V2Tooltip[];
    type: 'datalens';
    updates: V2Update[];
    visualization: V2Visualization;
    shapes: V2Shape[];
    shapesConfig?: V2ShapesConfig;
    version: ChartsConfigVersion.V2;
    datasetsIds: string[];
    datasetsPartialFields: V2ChartsConfigDatasetField[][];
};

type V2Update = {
    action: 'add_field' | 'add' | 'update_field' | 'update' | 'delete' | 'delete_field';
    field: any;
    debug_info?: string;
};

interface V2CommonSharedExtraSettings {
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
    navigatorSettings?: V2NavigatorSettings;
}

type V2NavigatorSettings = {
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

export type V2Filter = {
    guid: string;
    type: string;
    datasetId: string;
    disabled?: string;
    title: string;
    calc_mode: DatasetFieldCalcMode;
    filter: {
        operation: {
            code: string;
        };
        value?: string | string[];
    };
} & V2ClientOnlyFields;

type V2Sort = {
    guid: string;
    title: string;
    source?: string;
    datasetId: string;
    direction: string;
    data_type: string;
    format?: string;
    type: string;
    calc_mode: DatasetFieldCalcMode;
} & V2ClientOnlyFields;

type V2Link = {
    id: string;
    fields: Record<string, V2LinkField>;
};

type V2LinkField = {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
};

type V2Visualization = {
    id: string;
    highchartsId?: string;
    selectedLayerId?: string;
    layers?: V2Layer[];
    placeholders: V2Placeholder[];
};

type V2LayerSettings = {
    id: string;
    name: string;
    type: string;
    alpha: number;
    valid: boolean;
};

export type V2Layer = {
    id: string;
    commonPlaceholders: {
        colors: V2Color[];
        labels: V2Label[];
        tooltips: V2Tooltip[];
        filters: V2Filter[];
        colorsConfig: V2ColorsConfig;
        geopointsConfig?: V2PointSizeConfig;
        sort: V2Sort[];
    };
    layerSettings: V2LayerSettings;
    placeholders: V2Placeholder[];
};

type V2Placeholder = {
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
    items: V2Field[];
};

type V2Color = {
    datasetId: string;
    guid: string;
    title: string;
    type: string;
    data_type: string;
    formatting?: V2Formatting;
    calc_mode: DatasetFieldCalcMode;
} & V2ClientOnlyFields;

type V2Shape = {
    datasetId: string;
    guid: string;
    title: string;
    originalTitle?: string;
    type: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

type V2Tooltip = {
    datasetId: string;
    guid: string;
    title: string;
    formatting?: V2Formatting;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
} & V2ClientOnlyFields;

export type V2Formatting = {
    format?: 'number' | 'percent';
    showRankDelimiter?: boolean;
    prefix?: string;
    postfix?: string;
    unit?: 'auto' | 'k' | 'm' | 'b' | 't';
    precision?: number;
};

type V2Label = {
    datasetId: string;
    type: string;
    title: string;
    guid: string;
    formatting?: V2Formatting;
    format?: string;
    labelMode?: string;
    data_type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type V2HierarchyField = {
    data_type: string;
    fields: V2Field[];
    type: string;
};

type V2PointSizeConfig = {
    radius: number;
    minRadius: number;
    maxRadius: number;
};

export type V2Field = {
    data_type: string;
    fields?: V2Field[];
    type: string;
    title: string;
    guid: string;
    formatting?: V2Formatting;
    format?: string;
    labelMode?: string;
    datasetId: string;
    dateMode?: string;
    source?: string;
    datasetName?: string;
    hideLabelMode?: string;
    calc_mode: DatasetFieldCalcMode;
} & V2ClientOnlyFields;

type V2ColorsConfig = {
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

type V2ShapesConfig = {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
};

export type V2ChartsConfigDatasetField = {
    guid: string;
    title: string;
};

type V2ClientOnlyFields = {
    fakeTitle?: string;
    originalTitle?: string;
};
