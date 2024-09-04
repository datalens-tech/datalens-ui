import type {WrappedMarkdown} from '../../../../../../../shared/utils/markdown';
import type {ExtendedPointOptionsObject} from '../../utils/color-helpers';

export type ScatterPoint = ExtendedPointOptionsObject & {
    xLabel?: string | WrappedMarkdown;
    yLabel?: string | WrappedMarkdown;
    cLabel?: string | null | WrappedMarkdown;
    sLabel?: string | WrappedMarkdown;
    sizeValue?: number | null;
    sizeLabel?: string | null | WrappedMarkdown;
    x?: number;
    y?: number;
    value?: number;
    marker?: {
        radius?: number;
    };
    custom?: Record<string, any>;
};
