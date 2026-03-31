import type {AreaSeries, AreaSeriesData} from '@gravity-ui/chartkit/gravity-charts';

import type {SeriesExportSettings, WrappedHTML, WrappedMarkdown} from '../../../../../../../shared';

export type ExtendedAreaSeriesData = Omit<AreaSeriesData, 'x'> & {
    x?: AreaSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

export type ExtendedAreaSeries = Omit<AreaSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedAreaSeriesData[];
};
