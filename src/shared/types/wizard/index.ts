import type {IconProps} from '@gravity-ui/uikit';

import type {
    ChartsConfig,
    Dataset,
    FilterField,
    HierarchyField,
    Link,
    ServerCommonSharedExtraSettings,
    ServerDatasetField,
    ServerTooltipConfig,
    WidgetSizeType,
} from '../';
import type {
    ColorMode,
    GradientType,
    NavigatorLinesMode,
    NavigatorPeriod,
    WizardVisualizationId,
} from '../../constants';
import type {CommonUpdate, CommonUpdateField} from '../common-update';
import type {IconId} from '../configs';
import type {DatasetField} from '../dataset';

import type {Field} from './field';
import type {Placeholder} from './placeholder';
import type {ChartsConfigVersion} from './versions';

export * from './formatting';
export * from './field';
export * from './versions';
export * from './bars';
export * from './column';
export * from './background-settings';
export * from './misc';
export * from './placeholder';
export * from './sub-totals';
export * from './export';

export type VisualizationIconProps = Omit<IconProps, 'data'> & {
    id: IconId;
};

export interface DrillDownData {
    breadcrumbs: string[];
    filters: string[];
    level: number;
    fields: Field[];
    isColorDrillDown?: boolean;
}

export interface SharedData {
    drillDownData?: DrillDownData;
    metaHierarchy?: Record<string, {hierarchyIndex: number; hierarchyFieldIndex: number}>;
}
export type NavigatorSettings = {
    navigatorMode: string;
    isNavigatorAvailable: boolean;
    selectedLines: string[];
    linesMode: NavigatorLinesMode;
    periodSettings: NavigatorPeriod;
};

export interface ColorsConfig {
    thresholdsMode?: string;
    leftThreshold?: string;
    middleThreshold?: string;
    rightThreshold?: string;
    gradientPalette?: string;
    gradientMode?: GradientType;
    polygonBorders?: string;
    reversed?: boolean;
    fieldGuid?: string;
    mountedColors?: Record<string, string>;
    coloredByMeasure?: boolean;
    palette?: string;
    colorMode?: ColorMode;
}

export enum LabelsPositions {
    Outside = 'outside',
    Inside = 'inside',
}

export const enum LegendDisplayMode {
    Show = 'show',
    Hide = 'hide',
}

export const enum IndicatorTitleMode {
    ByField = 'by-field',
    Manual = 'manual',
    Hide = 'hide',
}

export interface CommonSharedExtraSettings {
    title?: string;
    titleMode?: 'show' | 'hide';
    indicatorTitleMode?: IndicatorTitleMode;
    legendMode?: LegendDisplayMode;
    overlap?: 'on' | 'off';
    metricFontSize?: string;
    metricFontColor?: string;
    metricFontColorPalette?: string;
    tooltip?: ServerCommonSharedExtraSettings['tooltip'];
    tooltipSum?: 'on' | 'off';
    limit?: number;
    pagination?: 'on' | 'off';
    pivotInlineSort?: 'on' | 'off';
    // For old charts, navigatorMode was specified in the body of extraSettings
    navigatorMode?: string;
    navigatorSeriesName?: string;
    totals?: 'on' | 'off';
    pivotFallback?: 'on' | 'off';
    feed?: string;
    // For new charts, an object was created using the navigator settings.
    navigatorSettings?: NavigatorSettings;
    enableGPTInsights?: boolean;
    labelsPosition?: LabelsPositions;
    qlAutoExecuteChart?: 'on' | 'off';
    pinnedColumns?: number;
    stacking?: 'on' | 'off';
    size?: WidgetSizeType;
}

interface CommonShared {
    visualization: {
        id: unknown;
        highchartsId?: string;
        iconProps: VisualizationIconProps;
        name?: string;
        placeholders: unknown[];
        colorsRequired?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        availableLabelModes?: string[];
        hidden?: boolean;
    };
    title: string;
    extraSettings?: CommonSharedExtraSettings;
    datasets?: Dataset[];
    dataset?: Dataset;
    links: Link[];
    dimensions: DatasetField[];
    measures: DatasetField[];
    hierarchies: HierarchyField[];
    filters: FilterField[];
    colors: Field[];
    shapes: Field[];
    sort: Sort[];
    labels: Field[];
    tooltips: Field[];
    updates: Update[];
    colorsConfig: ColorsConfig;
    sharedData: SharedData;
    version?: ChartsConfigVersion.V1;
    datasetsIds?: string[];
    datasetsPartialFields?: ServerDatasetField[][];
    wizardDataset?: Dataset | undefined;
}

interface CommonSharedLayer extends CommonShared {
    visualization: {
        id: string;
        iconProps: VisualizationIconProps;
        name?: string;
        placeholders: Placeholder[];
        colorsRequired?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        availableLabelModes?: string[];
        hidden?: boolean;
        layerSettings: {
            id: string;
            name: string;
            type: VisualizationLayerType;
            alpha: number;
            valid: boolean;
        };
    };
}

export interface GraphShared extends CommonShared {
    visualization: {
        id:
            | WizardVisualizationId.Line
            | WizardVisualizationId.LineD3
            | WizardVisualizationId.Area
            | WizardVisualizationId.Area100p
            | WizardVisualizationId.Column
            | WizardVisualizationId.BarXD3
            | WizardVisualizationId.Column100p
            | WizardVisualizationId.Bar
            | WizardVisualizationId.Bar100p
            | WizardVisualizationId.BarYD3
            | WizardVisualizationId.BarY100pD3
            | WizardVisualizationId.Pie
            | WizardVisualizationId.PieD3
            | WizardVisualizationId.Donut
            | WizardVisualizationId.DonutD3
            | WizardVisualizationId.Scatter
            | WizardVisualizationId.ScatterD3
            | WizardVisualizationId.Treemap
            | WizardVisualizationId.TreemapD3;
        iconProps: VisualizationIconProps;
        name: string;
        hidden?: boolean;
        highchartsId?: string;
        placeholders: Placeholder[];
        colorsRequired?: boolean;
        onDesignItemsChange?: (args: {
            shapes?: Field[];
            colors?: Field[];
            prevColors?: Field[];
            isMultipleColorsSupported?: boolean;
            visualization: GraphShared['visualization'];
        }) => {shapes: Field[]; colors: Field[]};
        allowAvailable?: boolean;
        allowColors?: boolean;
        allowFilters?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        allowComments?: boolean;
        availableLabelModes?: string[];
        checkAllowedDesignItems?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
            isMultipleColorsSupported?: boolean;
        }) => boolean;
        checkAllowedLabels?: (item: Field) => boolean;
        checkAllowedShapes?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedSort?: (
            item: Field,
            visualization: GraphShared['visualization'],
            colors: Field[],
            segments?: Field[],
        ) => boolean;
        colorsCapacity?: number;
        shapesCapacity?: number;
        type?: string;
    };
    geopointsConfig: PointSizeConfig;
    title: string;
    colors: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;
}

export interface PointSizeConfig {
    radius: number;
    minRadius: number;
    maxRadius: number;
}

export interface TableShared extends CommonShared {
    visualization: {
        id: 'pivotTable' | 'flatTable';
        type?: string;
        name: string;
        iconProps: VisualizationIconProps;
        placeholders: Placeholder[];
        checkAllowedSort: (item: Field, visualization: TableShared['visualization']) => boolean;
        checkAllowedDesignItems?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedShapes?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        colorsRequired?: boolean;
        allowAvailable?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        allowFilters?: boolean;
        availableLabelModes?: string[];
        colorsCapacity?: number;
        shapesCapacity?: number;
    };
}

interface MetricShared extends CommonShared {
    visualization: {
        id: 'metric';
        iconProps: VisualizationIconProps;
        name: string;
        placeholders: Placeholder[];
        colorsRequired?: boolean;
        allowAvailable?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        allowFilters?: boolean;
        availableLabelModes?: string[];
        colorsCapacity?: number;
        shapesCapacity?: number;
        checkAllowedDesignItems?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedShapes?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
    };
}

export type GeoLayerType =
    | 'geopoint'
    | 'geopolygon'
    | 'heatmap'
    | 'polyline'
    | 'geopoint-with-cluster';

export type VisualizationLayerType = GeoLayerType | 'line' | 'column' | 'area';

export interface VisualizationLayerShared extends CommonSharedLayer {
    visualization: {
        id: VisualizationLayerType;
        layerSettings: {
            id: string;
            name: string;
            type: VisualizationLayerType;
            alpha: number;
            valid: boolean;
        };
        commonPlaceholders: {
            filters: FilterField[];
            colors: Field[];
            labels: Field[];
            tooltips: Field[];
            sort: Sort[];
            shapes: Field[];
            colorsConfig?: ColorsConfig;
            geopointsConfig?: PointSizeConfig;
            shapesConfig?: ShapesConfig;
            tooltipConfig?: ServerTooltipConfig;
        };
        name: string;
        iconProps: VisualizationIconProps;
        type?: string;
        placeholders: Placeholder[];
        colorsRequired?: boolean;
        allowAvailable?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        allowFilters?: boolean;
        allowLayerFilters?: boolean;
        allowTooltips?: boolean;
        availableLabelModes?: string[];
        checkAllowedDesignItems?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedShapes?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedTooltips?: (item: Field) => boolean;
        checkAllowedLabels?: (item: Field) => boolean;
        checkAllowedSort?: (
            item: Field,
            visualization: VisualizationLayerShared['visualization'],
        ) => boolean;
        hidden?: boolean;
        colorsCapacity?: number;
        shapesCapacity?: number;
    };
}

export interface VisualizationWithLayersShared extends CommonShared {
    visualization: {
        id: string;
        highchartsId?: string;
        type: string;
        iconProps: VisualizationIconProps;
        name: string;
        layers: VisualizationLayerShared['visualization'][];
        selectedLayerId: string;
        placeholders: Placeholder[];
        colorsRequired?: boolean;
        allowAvailable?: boolean;
        allowColors?: boolean;
        allowSegments?: boolean;
        allowShapes?: boolean;
        allowSort?: boolean;
        allowLabels?: boolean;
        allowToltips?: boolean;
        availableLabelModes?: string[];
        colorsCapacity?: number;
        shapesCapacity?: number;
        hidden?: boolean;
        checkAllowedDesignItems?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
        checkAllowedShapes?: (args: {
            item: Field;
            visualization?: Shared['visualization'];
            designItems: Field[];
        }) => boolean;
    };
}

export type Shared =
    | GraphShared
    | TableShared
    | MetricShared
    | VisualizationWithLayersShared
    | VisualizationLayerShared;

export function isGraphShared(shared: Shared): shared is GraphShared {
    return (
        shared.visualization.id === 'line' ||
        shared.visualization.id === 'area' ||
        shared.visualization.id === 'area100p' ||
        shared.visualization.id === 'column' ||
        shared.visualization.id === 'column100p' ||
        shared.visualization.id === 'bar' ||
        shared.visualization.id === 'bar100p' ||
        shared.visualization.id === 'pie' ||
        shared.visualization.id === 'donut' ||
        shared.visualization.id === 'scatter' ||
        shared.visualization.id === 'treemap'
    );
}

export const isGraphScatterShared = (shared: Shared): shared is GraphShared =>
    shared.visualization.id === 'scatter';

export const isTableShared = (shared: Shared): shared is TableShared =>
    shared.visualization.id === 'flatTable' || shared.visualization.id === 'pivotTable';

export const isMetricShared = (shared: Shared): shared is MetricShared =>
    shared.visualization.id === 'metric';

export type Update = CommonUpdate<Field>;
export type UpdateField = CommonUpdateField<Field>;

export type RawUpdate = Pick<Update, 'action'> & {
    field: Field;
};

export type Sort = Field & {
    direction: string;
};

export interface ShapesConfig {
    mountedShapes?: Record<string, string>;
    fieldGuid?: string;
}

export type ClientChartsConfig = {
    colors: Field[];
    colorsConfig: ColorsConfig;
    extraSettings: CommonSharedExtraSettings;
    filters: FilterField[];
    geopointsConfig: PointSizeConfig | undefined;
    hierarchies: HierarchyField[];
    labels: Field[];
    links: Link[];
    sort: Sort[];
    tooltips: Field[];
    type: 'datalens';
    updates: Update[];
    visualization: Shared['visualization'];
    shapes: Field[];
    shapesConfig: ShapesConfig;
    version: ChartsConfig['version'];
    datasetsIds: string[];
    datasetsPartialFields: ServerDatasetField[][];
    segments: Field[];
};

export type ClientChartsConfigWithDataset = ClientChartsConfig & {
    wizardDataset: Dataset | undefined;
};
