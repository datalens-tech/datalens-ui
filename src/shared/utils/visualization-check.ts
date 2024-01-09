import {Link, WizardVisualizationId} from '../../shared';
import {QLChartType} from '../constants';

export function isMonitoringOrPrometheusChart(chartType: string | null | undefined) {
    return chartType === QLChartType.Monitoringql || chartType === QLChartType.Promql;
}

export function isYAGRVisualization(chartType: string, visualizationId: string) {
    const isMonitoringOrPrometheus = isMonitoringOrPrometheusChart(chartType);

    return (
        isMonitoringOrPrometheus &&
        ['line', 'area', 'area100p', 'column', 'column100p'].includes(visualizationId)
    );
}

export function getItemLinkWithDatasets(
    item: {guid: string; datasetId: string},
    datasetId: string,
    links: Link[],
) {
    const targetLink =
        item.datasetId &&
        links.find((link) => {
            return link.fields[item.datasetId]?.field.guid === item.guid && link.fields[datasetId];
        });

    return targetLink;
}

export function isD3Visualization(id: WizardVisualizationId) {
    const d3Visualizations = [
        WizardVisualizationId.ScatterD3,
        WizardVisualizationId.PieD3,
        WizardVisualizationId.BarXD3,
        WizardVisualizationId.LineD3,
    ];
    return d3Visualizations.includes(id);
}
