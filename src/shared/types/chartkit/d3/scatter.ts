import type {WrappedMarkup} from '../../../utils';
import type {WrappedMarkdown} from '../../../utils/markdown';

export type PointCustomData = {
    name?: string | number | WrappedMarkdown | WrappedMarkup;
    xLabel?: string | WrappedMarkdown;
    yLabel?: string | WrappedMarkdown;
    cLabel?: string | null | WrappedMarkdown;
    sLabel?: string | null | WrappedMarkdown;
    sizeLabel?: string | null | WrappedMarkdown;
};

export type ScatterSeriesCustomData = {
    pointTitle?: string;
    xTitle?: string;
    yTitle?: string;
    colorTitle?: string;
    shapeTitle?: string;
    sizeTitle?: string;
};
