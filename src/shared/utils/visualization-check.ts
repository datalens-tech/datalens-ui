import {QLChartType} from '../types/ql/common';

export function isYAGRVisualization(chartType: string, visualizationId?: string) {
    const isMonitoringQLOrPromQL =
        chartType === QLChartType.Monitoringql || chartType === QLChartType.Promql;

    if (visualizationId) {
        return (
            isMonitoringQLOrPromQL &&
            ['line', 'area', 'area100p', 'column', 'column100p', 'bar', 'bar100p'].includes(
                visualizationId,
            )
        );
    } else {
        return isMonitoringQLOrPromQL;
    }
}
