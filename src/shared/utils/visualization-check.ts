import {Link} from '../../shared';
import {QLChartType} from '../constants/ql';

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
