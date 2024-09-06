import {isTrueArg} from '../../../../../../shared';
import type {ChartColorsConfig} from '../types';

export const LOG_TIMING = 'process' in globalThis && isTrueArg(process.env.SHOW_CHARTS_LOG_TIMING);
export const LOG_INFO = 'process' in globalThis && isTrueArg(process.env.SHOW_CHARTS_LOG);

export const LAT = 0;
export const LONG = 1;

export const DEFAULT_DATE_FORMAT = 'DD.MM.YYYY';
export const DEFAULT_DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';
export const DEFAULT_DATETIMETZ_FORMAT = 'DD.MM.YYYY HH:mm:ss Z';

export const SERVER_DATE_FORMAT = 'YYYY-MM-DD';
export const SERVER_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export const DATASET_DATA_URL_V1 = '/_bi/api/data/v1.5/datasets/{id}/result';
export const DATASET_DATA_URL_V2 = '/_bi_datasets/{id}/result';
export const DATASET_DATA_PIVOT_URL = '/_bi_datasets/{id}/pivot';
export const getColor = (colorIndex: number, colors: string[]) => {
    const index = colorIndex % colors.length;
    return colors[index];
};

export const getMountedColor = (colorsConfig: ChartColorsConfig, value: string | number) => {
    const {mountedColors = {}} = colorsConfig;

    const color = mountedColors[value];

    return isNaN(Number(color)) ? color : getColor(Number(color), colorsConfig.colors);
};

export const SORT_ORDER = {
    ASCENDING: {
        NUM: 1,
        STR: 'ASC',
    },
    DESCENDING: {
        NUM: -1,
        STR: 'DESC',
    },
};

export const DEFAULT_MIN_POINT_RADIUS = 2;
export const DEFAULT_MAX_POINT_RADIUS = 8;

// Heatmap does not support zIndex. Always located at the bottom;
export const GEO_MAP_LAYERS_LEVEL = {
    GEOPOINT: 3,
    POLYLINE: 2,
    POLYGON: 1,
};

export const PSEUDO = 'PSEUDO';

export const COLOR_SHAPE_SEPARATOR = '__COLOR_SHAPE_SEPARATOR__';
