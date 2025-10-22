import type {WrappedHTML} from '../../..';
import type {WrappedMarkup} from '../../../utils';
import type {WrappedMarkdown} from '../../../utils/markdown';
import type {SeriesExportSettings} from '../../wizard';

export type PointCustomData = {
    name?: string | number | WrappedMarkdown | WrappedMarkup | WrappedHTML;
    xLabel?: string | WrappedMarkdown | WrappedHTML;
    yLabel?: string | WrappedMarkdown | WrappedHTML;
    colorValue?: unknown;
    cLabel?: string | null | WrappedMarkdown | WrappedHTML;
    shapeValue?: unknown;
    sLabel?: string | null | WrappedMarkdown | WrappedHTML | WrappedMarkup;
    sizeValue?: unknown;
    sizeLabel?: string | null | WrappedMarkdown | WrappedHTML;
};

export type ScatterSeriesCustomData = {
    pointTitle?: string;
    xTitle?: string;
    yTitle?: string;
    colorTitle?: string;
    shapeTitle?: string;
    sizeTitle?: string;
    exportSettings?: SeriesExportSettings;
};
