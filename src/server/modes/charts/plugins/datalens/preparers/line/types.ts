import type {LineSeries, LineSeriesData} from '@gravity-ui/chartkit/gravity-charts';

import type {
    SeriesExportSettings,
    ServerField,
    ServerPlaceholderSettings,
    WrappedHTML,
    WrappedMarkdown,
} from '../../../../../../../shared';
import type {ChartKitFormatSettings} from '../types';

export type LinesRecord = {
    [key: string]: LineTemplate;
};

export type MergedYSectionItems = {
    field: ServerField;
    lines: LinesRecord;
    nullsSetting: ServerPlaceholderSettings['nulls'];
    isFirstSection: boolean;
    labelsValues: Record<string, Record<string, any>>;
};

export type LineTemplate = {
    data: Record<string | number, LineData>;
    // colorValue for the entire series.
    colorValue: string | number | undefined;
    title: string;
    legendTitle: string | WrappedHTML;
    stack: string | number | Date | undefined;
    colorKey: string | undefined;
    tooltip: string;
    dataLabels: ChartKitFormatSettings & {enabled?: boolean};
    formattedName: string | undefined;
    drillDownFilterValue: string | undefined;
    shapeValue: string | undefined;
    colorShapeValue: string | undefined;
    segmentNameKey: string | null | undefined;
    fieldTitle: string;
    id?: string;
    pointConflict?: boolean;
};

export type LineData = {
    value: string | number | undefined | null;
    // colorValue for a specific point.
    // So far, it is used only for coloring by indicators.
    colorValue?: number;
};

export type ExtendedLineSeriesData = Omit<LineSeriesData, 'x'> & {
    x?: LineSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

export type ExtendedLineSeries = Omit<LineSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedLineSeriesData[];
};
