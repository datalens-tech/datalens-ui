import {VISUALIZATION_IDS, isTrueArg} from '../../../../../../shared';

export const LOG_TIMING = 'process' in globalThis && isTrueArg(process.env.SHOW_CHARTS_LOG_TIMING);
export const LOG_INFO = 'process' in globalThis && isTrueArg(process.env.SHOW_CHARTS_LOG);

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export const LINEAR_VISUALIZATIONS = new Set([
    VISUALIZATION_IDS.LINE,
    VISUALIZATION_IDS.AREA,
    VISUALIZATION_IDS.AREA_100P,
    VISUALIZATION_IDS.COLUMN,
    VISUALIZATION_IDS.COLUMN_100P,
    VISUALIZATION_IDS.BAR,
    VISUALIZATION_IDS.BAR_100P,
]);

export const PIE_VISUALIZATIONS = new Set([
    VISUALIZATION_IDS.PIE,
    VISUALIZATION_IDS.PIE3D,
    VISUALIZATION_IDS.DONUT,
]);

export const QUERY_TITLE = 'query #';
export const QUERY_ALIAS_TITLE = '_alias';
