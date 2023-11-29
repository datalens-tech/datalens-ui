import {LabelsPositions} from 'shared';

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

import {BAR_X_D3_VISUALIZATION} from './bar-x';
import {COMBINED_CHART_VISUALIZATION} from './combined-chart';
import {DONUT_VISUALIZATION} from './donut';
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
    LINE_VISUALIZATION,
} from './line';
import {METRIC_VISUALIZATION} from './metric';
import {PIE_D3_VISUALIZATION, PIE_VISUALIZATION} from './pie';
import {PIVOT_TABLE_VISUALIZATION} from './pivotTable';
import {POLYLINE_VISUALIZATION} from './polyline';
import {SCATTER_D3_VISUALIZATION, SCATTER_VISUALIZATION} from './scatter';
import {TREEMAP_VISUALIZATION} from './treemap';

export const SETTINGS = {
    AXIS_FORMAT_MODE: {
        AUTO: 'auto',
        BY_FIELD: 'by-field',
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
        IGNORE: 'ignore',
        CONNECT: 'connect',
        AS_ZERO: 'as-0',
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
        DISCRETE: 'discrete',
        CONTINUOUS: 'continuous',
    },
};

export const CHART_SETTINGS = {
    TITLE_MODE: {
        SHOW: 'show',
        HIDE: 'hide',
    },
    LEGEND: {
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
};

export const VISUALIZATION_IDS = {
    LINE: LINE_VISUALIZATION.id,
    AREA: AREA_VISUALIZATION.id,
    AREA_100P: AREA_100P_VISUALIZATION.id,
    COLUMN: COLUMN_VISUALIZATION.id,
    COLUMN_100P: COLUMN_100P_VISUALIZATION.id,
    BAR: BAR_VISUALIZATION.id,
    BAR_100P: BAR_100P_VISUALIZATION.id,
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
};

export const DEFAULT_VISUALIZATION_ID_WIZARD = VISUALIZATION_IDS.COLUMN;
