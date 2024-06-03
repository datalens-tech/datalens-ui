import type {Shared, SharedData, V10PlaceholderSettings} from '../../index';

import type {
    V10ChartsConfig,
    V10ChartsConfigDatasetField,
    V10ColorsConfig,
    V10CommonPlaceholders,
    V10CommonSharedExtraSettings,
    V10Field,
    V10Filter,
    V10Formatting,
    V10HierarchyField,
    V10Layer,
} from './v10';
import type {V2ChartsConfig} from './v2';
import type {V3ChartsConfig} from './v3';
import type {V4ChartsConfig} from './v4';
import type {V5ChartsConfig} from './v5';
import type {V6ChartsConfig} from './v6';
import type {V7ChartsConfig} from './v7';
import type {V8ChartsConfig} from './v8';
import type {V9ChartsConfig} from './v9';

export * from './v2';
export * from './v3';
export * from './v4';
export * from './v5';
export * from './v6';
export * from './v7';
export * from './v8';
export * from './v9';
export * from './v10';

export type ChartsConfig = V10ChartsConfig;
export type PreviousChartsConfigs =
    | Shared
    | V2ChartsConfig
    | V3ChartsConfig
    | V4ChartsConfig
    | V5ChartsConfig
    | V6ChartsConfig
    | V7ChartsConfig
    | V8ChartsConfig
    | V9ChartsConfig;
export type CommonPlaceholders = V10CommonPlaceholders;

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

export type ServerFieldFormatting = V10Formatting;

export type ServerShapesConfig = ChartsConfig['shapesConfig'];

export type ServerColorsConfig = V10ColorsConfig;

export type ServerPointSizeConfig = NonNullable<ChartsConfig['geopointsConfig']>;

export type ServerField = V10Field;

export type ServerFilter = V10Filter;

export type ServerDatasetField = V10ChartsConfigDatasetField;

export type ServerVisualizationLayer = V10Layer;

export type ServerLink = ChartsConfig['links'][0];

export type ServerHierarchy = V10HierarchyField;

export type ServerCommonSharedExtraSettings = V10CommonSharedExtraSettings;

export type ServerPlaceholderSettings = V10PlaceholderSettings;
