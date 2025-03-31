export const VISUALIZATION_IDS = {
    LINE: 'line',
    AREA: 'area',
    AREA_100P: 'area100p',
    COLUMN: 'column',
    COLUMN_100P: 'column100p',
    BAR: 'bar',
    BAR_100P: 'bar100p',
    PIE: 'pie',
    PIE3D: 'pie3d',
    DONUT: 'donut',
    METRIC: 'metric',
    TABLE: 'table',
};

export enum QLChartType {
    Sql = 'sql',
    Promql = 'promql',
    Monitoringql = 'monitoringql',
}

export enum QLParamType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date',
    Datetime = 'datetime',
    DateInterval = 'date-interval',
    DatetimeInterval = 'datetime-interval',
}
