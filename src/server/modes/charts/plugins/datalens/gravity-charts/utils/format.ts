import type {ValueFormat} from '@gravity-ui/chartkit/gravity-charts';

import type {ServerField} from '../../../../../../../shared';
import {getFormatOptions, isNumberField} from '../../../../../../../shared';

export function getFieldFormatOptions({field}: {field?: ServerField}): ValueFormat | undefined {
    if (isNumberField(field)) {
        const fieldFormatting = getFormatOptions(field);

        const labelFormat =
            fieldFormatting?.labelMode === 'percent' ? 'percent' : fieldFormatting?.format;

        return {
            type: 'number',
            ...fieldFormatting,
            format: labelFormat,
        };
    }

    return undefined;
}
