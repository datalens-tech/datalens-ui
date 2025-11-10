import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';

export * from './scatter';

export type ExtendedChartData = ChartData & {
    custom?: {
        tooltip?: {
            headerLabel?: string;
        };
    };
};
