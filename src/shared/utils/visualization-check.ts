import type {FeatureConfig, Link} from '../../shared';
import {Feature, WizardVisualizationId} from '../../shared';
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

export function isGravityChartsVisualization({
    id,
    features,
}: {
    id: string;
    features?: FeatureConfig;
}) {
    const isPieOrTreemap = [
        WizardVisualizationId.Pie,
        WizardVisualizationId.Donut,
        WizardVisualizationId.Treemap,
    ].includes(id as WizardVisualizationId);
    if (isPieOrTreemap && features?.[Feature.GravityChartsForPieAndTreemap]) {
        return true;
    }

    const isScatterOrBarY = [
        WizardVisualizationId.Bar,
        WizardVisualizationId.Bar100p,
        WizardVisualizationId.Scatter,
    ].includes(id as WizardVisualizationId);
    if (isScatterOrBarY && features?.[Feature.GravityChartsForBarYAndScatter]) {
        return true;
    }

    const isLineAreaOrBarX = [
        WizardVisualizationId.Line,
        WizardVisualizationId.Area,
        WizardVisualizationId.Area100p,
        WizardVisualizationId.Column,
        WizardVisualizationId.Column100p,
        WizardVisualizationId.CombinedChart,
    ].includes(id as WizardVisualizationId);
    if (isLineAreaOrBarX && features?.[Feature.GravityChartsForLineAreaAndBarX]) {
        return true;
    }

    return false;
}
