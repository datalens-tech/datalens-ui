import {QLChartType} from '../constants';

const chartTypeWithMultipleColors: Record<string, boolean> = {
    [QLChartType.Monitoringql]: true,
};
export const isChartSupportMultipleColors = (chartType: string) =>
    chartTypeWithMultipleColors[chartType];
