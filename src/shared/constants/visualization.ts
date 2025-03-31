export enum WizardVisualizationId {
    Line = 'line',
    LineD3 = 'line-d3',
    Area = 'area',
    Area100p = 'area100p',
    Column = 'column',
    Column100p = 'column100p',
    Bar = 'bar',
    BarYD3 = 'bar-y-d3',
    Bar100p = 'bar100p',
    BarY100pD3 = 'bar-y-100p-d3',
    BarXD3 = 'bar-x-d3',
    Scatter = 'scatter',
    ScatterD3 = 'scatter-d3',
    Pie = 'pie',
    Pie3D = 'pie3d',
    PieD3 = 'pie-d3',
    Donut = 'donut',
    DonutD3 = 'donut-d3',
    Metric = 'metric',
    Treemap = 'treemap',
    TreemapD3 = 'treemap-d3',
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
    Pie3D = 'pie3d',
    Metric = 'metric',
    FlatTable = 'table',
}

export const PERCENT_VISUALIZATIONS = new Set<string>([
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.BarY100pD3,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Area100p,
]);

export const VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER = new Set<string>([
    WizardVisualizationId.Column,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.BarXD3,
    WizardVisualizationId.BarYD3,
    WizardVisualizationId.BarY100pD3,
]);

export const VISUALIZATIONS_WITH_LABELS = new Set<string>([
    WizardVisualizationId.Line,
    WizardVisualizationId.Area,
    WizardVisualizationId.Area100p,
    WizardVisualizationId.Column,
    WizardVisualizationId.Column100p,
    WizardVisualizationId.Bar,
    WizardVisualizationId.Bar100p,
    WizardVisualizationId.BarXD3,
    WizardVisualizationId.BarYD3,
    WizardVisualizationId.BarY100pD3,
]);

export const VISUALIZATIONS_WITH_LABELS_POSITION = new Set<string>([
    WizardVisualizationId.Column,
    WizardVisualizationId.Bar,
    WizardVisualizationId.BarXD3,
    WizardVisualizationId.BarYD3,
]);
