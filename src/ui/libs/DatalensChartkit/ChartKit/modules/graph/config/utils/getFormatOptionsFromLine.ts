import type {FormatNumberOptions} from 'shared/modules/format-units/types';

import type {TooltipLine} from '../../tooltip/types';

export const getFormatOptionsFromLine = (
    line?: Partial<TooltipLine>,
): FormatNumberOptions | undefined => {
    if (!line) {
        return undefined;
    }

    const options: FormatNumberOptions = {
        format: line.chartKitFormat,
        postfix: line.chartKitPostfix,
        precision: line.chartKitPrecision,
        prefix: line.chartKitPrefix,
        showRankDelimiter: line.chartKitShowRankDelimiter,
        unit: line.chartKitUnit,
    };
    const hasValues = Object.values(options).some((value) => typeof value !== 'undefined');

    return hasValues ? options : undefined;
};
