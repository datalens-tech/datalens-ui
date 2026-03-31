import type {BarXSeries, BarXSeriesData} from '@gravity-ui/chartkit/gravity-charts';

import type {SeriesExportSettings, WrappedMarkdown} from '../../../../../../../shared';
import type {WrappedHTML} from '../../../../../../../shared/types/charts';

export type ExtendedBarXSeriesData = Omit<BarXSeriesData, 'x'> & {
    x?: BarXSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

export type ExtendedBarXSeries = Omit<BarXSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
        colorValue?: string;
    };
    data: ExtendedBarXSeriesData[];
};
