export enum WizardType {
    GraphWizardNode = 'graph_wizard_node',
    TableWizardNode = 'table_wizard_node',
    YmapWizardNode = 'ymap_wizard_node',
    MetricWizardNode = 'metric_wizard_node',
    MarkupWizardNode = 'markup_wizard_node',
    TimeseriesWizardNode = 'timeseries_wizard_node',
    GravityChartsWizardNode = 'd3_wizard_node',
}

export enum LegacyEditorType {
    Graph = 'graph',
    Table = 'table',
    Map = 'map',
    Manager = 'manager',
    Text = 'text',
    Metric = 'metric',
    BlankChart = 'blank-chart_node',
}

export enum EditorType {
    Module = 'module',
    GraphNode = 'graph_node',
    TableNode = 'table_node',
    TextNode = 'text_node',
    MetricNode = 'metric_node',
    MapNode = 'map_node',
    YmapNode = 'ymap_node',
    ControlNode = 'control_node',
    MarkdownNode = 'markdown_node',
    MarkupNode = 'markup_node',
    GravityChartsNode = 'd3_node',
    AdvancedChartNode = 'advanced-chart_node',
}

export enum WidgetKind {
    Graph = 'graph',
    Table = 'table',
    Map = 'map',
    Manager = 'manager',
    Text = 'text',
    Metric = 'metric',
    Ymap = 'ymap',
    Control = 'control',
    Markdown = 'markdown',
    Markup = 'markup',
    GravityCharts = 'd3',
    AdvancedChart = 'advanced-chart',
}

export type WidgetType = LegacyEditorType | EditorType | WizardType;
