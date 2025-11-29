export enum WizardVisualizationId {
    Line = 'line',
    Area = 'area',
    Area100p = 'area100p',
    Column = 'column',
    Column100p = 'column100p',
    Bar = 'bar',
    Bar100p = 'bar100p',
    Scatter = 'scatter',
    Pie = 'pie',
    Donut = 'donut',
    Metric = 'metric',
    Treemap = 'treemap',
    FlatTable = 'flatTable',
    PivotTable = 'pivotTable',
    Geolayer = 'geolayer',
    Geopoint = 'geopoint',
    Geopolygon = 'geopolygon',
    GeopointWithCluster = 'geopoint-with-cluster',
    CombinedChart = 'combined-chart',
}

export enum QlVisualizationId {
    Line = 'line',
    Area = 'area',
    Area100p = 'area100p',
    Column = 'column',
    Column100p = 'column100p',
    Bar = 'bar',
    Pie = 'pie',
    Metric = 'metric',
    FlatTable = 'table',
}

export const PERCENT_VISUALIZATIONS = new Set<string>([
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Area100p,
]);

export const VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER = new Set<string>([
    WizardVisualizationId.Column,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
]);

export const VISUALIZATIONS_WITH_LABELS = new Set<string>([
    WizardVisualizationId.Line,
    WizardVisualizationId.Area,
    WizardVisualizationId.Area100p,
    WizardVisualizationId.Column,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
]);

export const VISUALIZATIONS_WITH_LABELS_POSITION = new Set<string>([
    WizardVisualizationId.Column,
    WizardVisualizationId.Bar,
]);
