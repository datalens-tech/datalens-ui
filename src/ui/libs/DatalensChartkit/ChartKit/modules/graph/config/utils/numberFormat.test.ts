import {i18nInstance} from 'shared/modules/format-units/i18n/i18n';
import type {FormatNumberOptions} from 'shared/modules/format-units/types';

import {numberFormat} from './numberFormat';

i18nInstance.setLang('en');

describe('chartkit/graph/config/utils', () => {
    test.each<[number, number | undefined, FormatNumberOptions | undefined, string | null]>([
        [100, undefined, undefined, '100'],
        [100, 0, undefined, '100'],
        [100, 2, undefined, '100.00'],
        [100, 21, undefined, '100.00000000000000000000'],
        [NaN, 0, undefined, null],
        [100, undefined, undefined, '100'],
        [100, 2, {precision: 3}, '100.000'],
        [100.234, 2, {precision: 3}, '100.234'],
        [100000, undefined, {unit: 'k'}, '100K'],
        [100000, 2, {unit: 'k'}, '100.00K'],
    ])('numberFormat (args: {value: %p, round: %p})', (value, round, options, expected) => {
        const result = numberFormat(value, round, options);
        expect(result).toEqual(expected);
    });
});
