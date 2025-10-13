import type {WrappedHTML, WrappedMarkup} from '../../../../../../../shared';
import type {WrappedMarkdown} from '../../../../../../../shared/utils/markdown';
import type {ExtendedPointOptionsObject} from '../../utils/color-helpers';

export type ScatterPoint = ExtendedPointOptionsObject & {
    xLabel?: string | WrappedMarkdown | WrappedHTML;
    yLabel?: string | WrappedMarkdown | WrappedHTML;
    cLabel?: string | null | WrappedMarkdown | WrappedHTML;
    sLabel?: string | WrappedMarkdown | WrappedHTML | WrappedMarkup;
    sizeValue?: number | null;
    sizeLabel?: string | null | WrappedMarkdown | WrappedHTML;
    x?: number;
    y?: number;
    value?: number;
    marker?: {
        radius?: number;
    };
    custom?: Record<string, any>;
};
