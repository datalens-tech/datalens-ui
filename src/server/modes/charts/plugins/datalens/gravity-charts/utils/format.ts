import type {ValueFormat} from '@gravity-ui/chartkit/gravity-charts';
import {isEmpty} from 'lodash';

import type {ServerField} from '../../../../../../../shared';
import {MINIMUM_FRACTION_DIGITS, isFloatField, isNumberField} from '../../../../../../../shared';

export function getFieldFormatOptions({field}: {field?: ServerField}): ValueFormat | undefined {
    if (isNumberField(field)) {
        let precision = 0;
        if (isFloatField(field)) {
            precision =
                typeof field.formatting?.precision === 'number'
                    ? field.formatting.precision
                    : MINIMUM_FRACTION_DIGITS;
        }

        const format: ValueFormat = {
            type: 'number',
            precision,
        };

        if (isEmpty(field.formatting)) {
            return format;
        }

        const labelFormat =
            field.formatting?.labelMode === 'percent' ? 'percent' : field.formatting?.format;
        return {
            ...format,
            prefix: field.formatting?.prefix,
            postfix: field.formatting?.postfix,
            unit: field.formatting?.unit,
            format: labelFormat,
            showRankDelimiter: field.formatting?.showRankDelimiter,
        };
    }

    return undefined;
}
