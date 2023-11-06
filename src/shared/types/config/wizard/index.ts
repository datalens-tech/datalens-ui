import {Shared, SharedData, V9PlaceholderSettings} from '../../index';

import {V2ChartsConfig} from './v2';
import {V3ChartsConfig} from './v3';
import {V4ChartsConfig} from './v4';
import {V5ChartsConfig} from './v5';
import {V6ChartsConfig} from './v6';
import type {V7ChartsConfig} from './v7';
import type {V8ChartsConfig} from './v8';
import type {
    V9ChartsConfig,
    V9ChartsConfigDatasetField,
    V9ColorsConfig,
    V9CommonPlaceholders,
    V9CommonSharedExtraSettings,
    V9Field,
    V9Filter,
    V9Formatting,
    V9HierarchyField,
    V9Layer,
} from './v9';

export * from './v2';
export * from './v3';
export * from './v4';
export * from './v5';
export * from './v6';
export * from './v7';
export * from './v8';
export * from './v9';

export type ChartsConfig = V9ChartsConfig;
export type PreviousChartsConfigs =
    | Shared
    | V2ChartsConfig
    | V3ChartsConfig
    | V4ChartsConfig
    | V5ChartsConfig
    | V6ChartsConfig
    | V7ChartsConfig
    | V8ChartsConfig;
export type CommonPlaceholders = V9CommonPlaceholders;

export type ExtendedChartsConfig = ChartsConfig | PreviousChartsConfigs;

export type ServerChartsConfig = ChartsConfig & {
    sharedData: SharedData;
};

export type ServerPlaceholder = ChartsConfig['visualization']['placeholders'][0];

export type ServerVisualization = ChartsConfig['visualization'];

export type ServerColor = ChartsConfig['colors'][0];

export type ServerSort = ChartsConfig['sort'][0];

export type ServerTooltip = ChartsConfig['tooltips'][0];

export type ServerLabel = ChartsConfig['labels'][0];

export type ServerShape = ChartsConfig['shapes'][0];

export type ServerLayerSettings = NonNullable<
    ChartsConfig['visualization']['layers']
>[0]['layerSettings'];

export type ServerFieldFormatting = V9Formatting;

export type ServerShapesConfig = ChartsConfig['shapesConfig'];

export type ServerColorsConfig = V9ColorsConfig;

export type ServerPointSizeConfig = NonNullable<ChartsConfig['geopointsConfig']>;

export type ServerField = V9Field;

export type ServerFilter = V9Filter;

export type ServerDatasetField = V9ChartsConfigDatasetField;

export type ServerVisualizationLayer = V9Layer;

export type ServerLink = ChartsConfig['links'][0];

export type ServerHierarchy = V9HierarchyField;

export type ServerCommonSharedExtraSettings = V9CommonSharedExtraSettings;

export type ServerPlaceholderSettings = V9PlaceholderSettings;
