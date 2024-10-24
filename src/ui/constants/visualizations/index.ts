import {
    AxisLabelFormatMode,
    AxisMode,
    AxisNullsMode,
    LabelsPositions,
    LegendDisplayMode,
} from 'shared';

export * from './flatTable';
export * from './pivotTable';
export * from './geopoint';
export * from './geolayer';
export * from './heatmap';
export * from './geopolygon';
export * from './polyline';
export * from './pie';
export * from './donut';
export * from './treemap';
export * from './line';
export * from './metric';
export * from './combined-chart';
export * from './scatter';
export * from './bar-x';
export * from './bar-y';

import {BAR_X_D3_VISUALIZATION} from './bar-x';
import {BAR_Y_100P_D3_VISUALIZATION, BAR_Y_D3_VISUALIZATION} from './bar-y';
import {COMBINED_CHART_VISUALIZATION} from './combined-chart';
import {DONUT_D3_VISUALIZATION, DONUT_VISUALIZATION} from './donut';
import {FLAT_TABLE_VISUALIZATION} from './flatTable';
import {GEOLAYER_VISUALIZATION} from './geolayer';
import {GEOPOINT_VISUALIZATION, GEOPOINT_WITH_CLUSTER_VISUALIZATION} from './geopoint';
import {GEOPOLYGON_VISUALIZATION} from './geopolygon';
import {HEATMAP_VISUALIZATION} from './heatmap';
import {
    AREA_100P_VISUALIZATION,
    AREA_VISUALIZATION,
    BAR_100P_VISUALIZATION,
    BAR_VISUALIZATION,
    COLUMN_100P_VISUALIZATION,
    COLUMN_VISUALIZATION,
    LINE_D3_VISUALIZATION,
    LINE_VISUALIZATION,
} from './line';
import {METRIC_VISUALIZATION} from './metric';
import {PIE_D3_VISUALIZATION, PIE_VISUALIZATION} from './pie';
import {PIVOT_TABLE_VISUALIZATION} from './pivotTable';
import {POLYLINE_VISUALIZATION} from './polyline';
import {SCATTER_D3_VISUALIZATION, SCATTER_VISUALIZATION} from './scatter';
import {TREEMAP_D3_VISUALIZATION, TREEMAP_VISUALIZATION} from './treemap';

export const SETTINGS = {
    AXIS_FORMAT_MODE: {
        AUTO: AxisLabelFormatMode.Auto,
        BY_FIELD: AxisLabelFormatMode.ByField,
    },
    SCALE: {
        AUTO: 'auto',
        MANUAL: 'manual',
    },
    SCALE_VALUE: {
        MIN_MAX: 'min-max',
        ZERO_MAX: '0-max',
    },
    TITLE: {
        AUTO: 'auto',
        MANUAL: 'manual',
        OFF: 'off',
    },
    TYPE: {
        LINEAR: 'linear',
        LOGARITHMIC: 'logarithmic',
    },
    AXIS_VISIBILITY: {
        SHOW: 'show',
        HIDE: 'hide',
    },
    GRID: {
        ON: 'on',
        OFF: 'off',
    },
    GRID_STEP: {
        AUTO: 'auto',
        MANUAL: 'manual',
    },
    HIDE_LABELS: {
        YES: 'yes',
        NO: 'no',
    },
    LABELS_VIEW: {
        AUTO: 'auto',
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
        ANGLE: 'angle',
    },
    NULLS: {
        IGNORE: AxisNullsMode.Ignore,
        CONNECT: AxisNullsMode.Connect,
        AS_ZERO: AxisNullsMode.AsZero,
        USE_PREVIOUS: AxisNullsMode.UsePrevious,
    },
    HOLIDAYS: {
        ON: 'on',
        OFF: 'off',
    },
    POLYLINE_POINTS: {
        ON: 'on',
        OFF: 'off',
    },
    AXIS_MODE: {
        DISCRETE: AxisMode.Discrete,
        CONTINUOUS: AxisMode.Continuous,
    },
};

export const CHART_SETTINGS = {
    TITLE_MODE: {
        SHOW: 'show',
        HIDE: 'hide',
    },
    LEGEND: {
        SHOW: LegendDisplayMode.Show,
        HIDE: LegendDisplayMode.Hide,
    },
    TOOLTIP: {
        SHOW: 'show',
        HIDE: 'hide',
    },
    TOOLTIP_SUM: {
        ON: 'on',
        OFF: 'off',
    },
    NAVIGATOR: {
        SHOW: 'show',
        HIDE: 'hide',
    },
    PAGINATION: {
        ON: 'on',
        OFF: 'off',
    },
    GROUPPING: {
        ON: 'on',
        OFF: 'off',
    },
    TOTALS: {
        ON: 'on',
        OFF: 'off',
    },
    PIVOT_FALLBACK: {
        ON: 'on',
        OFF: 'off',
    },
    OVERLAP: {
        ON: 'on',
        OFF: 'off',
    },
    LABELS_POSITION: {
        INSIDE: LabelsPositions.Inside,
        OUTSIDE: LabelsPositions.Outside,
    },
    D3_FALLBACK: {
        ON: 'on',
        OFF: 'off',
    },
    QL_AUTO_EXECUTION_CHART: {
        ON: 'on',
        OFF: 'off',
    },
    PIVOT_INLINE_SORT: {
        ON: 'on',
        OFF: 'off',
    },
};

export const VISUALIZATION_IDS = {
    LINE: LINE_VISUALIZATION.id,
    LINE_D3: LINE_D3_VISUALIZATION.id,
    AREA: AREA_VISUALIZATION.id,
    AREA_100P: AREA_100P_VISUALIZATION.id,
    COLUMN: COLUMN_VISUALIZATION.id,
    COLUMN_100P: COLUMN_100P_VISUALIZATION.id,
    BAR: BAR_VISUALIZATION.id,
    BAR_Y_D3: BAR_Y_D3_VISUALIZATION.id,
    BAR_100P: BAR_100P_VISUALIZATION.id,
    BAR_Y_100P_D3: BAR_Y_100P_D3_VISUALIZATION.id,
    SCATTER: SCATTER_VISUALIZATION.id,
    PIE: PIE_VISUALIZATION.id,
    METRIC: METRIC_VISUALIZATION.id,
    TREEMAP: TREEMAP_VISUALIZATION.id,
    FLAT_TABLE: FLAT_TABLE_VISUALIZATION.id,
    PIVOT_TABLE: PIVOT_TABLE_VISUALIZATION.id,
    GEOPOINT: GEOPOINT_VISUALIZATION.id,
    GEOPOINT_WITH_CLUSTER: GEOPOINT_WITH_CLUSTER_VISUALIZATION.id,
    GEOPOLYGON: GEOPOLYGON_VISUALIZATION.id,
    HEATMAP: HEATMAP_VISUALIZATION.id,
    GEOLAYER: GEOLAYER_VISUALIZATION.id,
    POLYLINE: POLYLINE_VISUALIZATION.id,
    DONUT: DONUT_VISUALIZATION.id,
    COMBINED_CHART: COMBINED_CHART_VISUALIZATION.id,
    SCATTER_D3: SCATTER_D3_VISUALIZATION.id,
    PIE_D3: PIE_D3_VISUALIZATION.id,
    BAR_X_D3: BAR_X_D3_VISUALIZATION.id,
    DONUT_D3: DONUT_D3_VISUALIZATION.id,
    TREEMAP_D3: TREEMAP_D3_VISUALIZATION.id,
};

export const VISUALIZATIONS_BY_ID = {
    [LINE_VISUALIZATION.id]: LINE_VISUALIZATION,
    [AREA_VISUALIZATION.id]: AREA_VISUALIZATION,
    [AREA_100P_VISUALIZATION.id]: AREA_100P_VISUALIZATION,
    [COLUMN_VISUALIZATION.id]: COLUMN_VISUALIZATION,
    [COLUMN_100P_VISUALIZATION.id]: COLUMN_100P_VISUALIZATION,
    [BAR_VISUALIZATION.id]: BAR_VISUALIZATION,
    [BAR_100P_VISUALIZATION.id]: BAR_100P_VISUALIZATION,
    [SCATTER_VISUALIZATION.id]: SCATTER_VISUALIZATION,
    [PIE_VISUALIZATION.id]: PIE_VISUALIZATION,
    [METRIC_VISUALIZATION.id]: METRIC_VISUALIZATION,
    [TREEMAP_VISUALIZATION.id]: TREEMAP_VISUALIZATION,
    [FLAT_TABLE_VISUALIZATION.id]: FLAT_TABLE_VISUALIZATION,
    [PIVOT_TABLE_VISUALIZATION.id]: PIVOT_TABLE_VISUALIZATION,
    [GEOPOINT_VISUALIZATION.id]: GEOPOINT_VISUALIZATION,
    [GEOPOINT_WITH_CLUSTER_VISUALIZATION.id]: GEOPOINT_WITH_CLUSTER_VISUALIZATION,
    [GEOPOLYGON_VISUALIZATION.id]: GEOPOLYGON_VISUALIZATION,
    [HEATMAP_VISUALIZATION.id]: HEATMAP_VISUALIZATION,
    [GEOLAYER_VISUALIZATION.id]: GEOLAYER_VISUALIZATION,
    [POLYLINE_VISUALIZATION.id]: POLYLINE_VISUALIZATION,
    [DONUT_VISUALIZATION.id]: DONUT_VISUALIZATION,
    [COMBINED_CHART_VISUALIZATION.id]: COMBINED_CHART_VISUALIZATION,
    [SCATTER_D3_VISUALIZATION.id]: SCATTER_D3_VISUALIZATION,
    [PIE_D3_VISUALIZATION.id]: PIE_D3_VISUALIZATION,
    [BAR_X_D3_VISUALIZATION.id]: BAR_X_D3_VISUALIZATION,
    [LINE_D3_VISUALIZATION.id]: LINE_D3_VISUALIZATION,
    [DONUT_D3_VISUALIZATION.id]: DONUT_D3_VISUALIZATION,
};
