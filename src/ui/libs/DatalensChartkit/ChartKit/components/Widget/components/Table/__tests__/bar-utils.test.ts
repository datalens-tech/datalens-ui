import type React from 'react';

import type {
    BarProps,
    GetBarStyleArgs,
    GetMinMaxWithOffsetArgs,
    GetSeparatorStyleArgs,
    GetStylesArgs,
} from '../Bar/types';
import {
    getBarStyle,
    getMinMaxWithOffset,
    getRangeValue,
    getRangeValuePart,
    getSeparatorStyle,
    getStyles,
    isPropsValid,
} from '../Bar/utils';

describe('chartkit/Table/utils/bars-utils', () => {
    test.each<[number, number, number] /* [min, max, expected] */>([
        [0, 70, 70],
        [-10, 60, 70],
        [-70, 0, 70],
        [-70, -10, 80],
    ])('getRangeValue (args: {min: %i, max: %i})', (min, max, expected) => {
        const result = getRangeValue(min, max);
        expect(result).toEqual(expected);
    });

    test.each<[number, number, number] /* [rangeValue, value, expected] */>([
        [-20, 10, 50],
        [-20, 15, 75],
        [20, 15, 75],
        [20, 20, 100],
    ])('getRangeValuePart (args: {rangeValue: %i, value: %i})', (rangeValue, value, expected) => {
        const result = getRangeValuePart(rangeValue, value);
        expect(result).toEqual(expected);
    });

    test.each<[GetBarStyleArgs, React.CSSProperties] /* [args, expected] */>([
        [{value: 5}, {}],
        [
            {value: 5, max: 10, color: 'red'},
            {background: 'linear-gradient(to left, transparent 0% 50%, red 50% 100%)'},
        ],
        [
            {value: 5, max: 10, align: 'right', color: 'red'},
            {background: 'linear-gradient(to right, transparent 0% 50%, red 50% 100%)'},
        ],
        [
            {value: -5, min: -10, color: 'red'},
            {background: 'linear-gradient(to right, transparent 0% 50%, red 50% 100%)'},
        ],
        [
            {value: -5, min: -10, align: 'left', color: 'red'},
            {background: 'linear-gradient(to left, transparent 0% 50%, red 50% 100%)'},
        ],
        [
            {value: 5, min: -10, max: 10, color: 'red'},
            {
                background:
                    'linear-gradient(to right, transparent 0% 50%, red 50% 75%, transparent 75% 100%)',
            },
        ],
        [
            {value: -5, min: -10, max: 10, color: 'red'},
            {
                background:
                    'linear-gradient(to right, transparent 0% 25%, red 25% 50%, transparent 50% 100%)',
            },
        ],
    ])('getBarStyle (args: %j)', (args, expected) => {
        const result = getBarStyle(args);
        expect(result).toEqual(expected);
    });

    test.each<[GetSeparatorStyleArgs, React.CSSProperties | undefined] /* [args, expected] */>([
        [{min: undefined, max: 60}, undefined],
        [{min: 0, max: undefined}, undefined],
        [{min: -20, max: 0}, {left: '100%'}],
        [{min: 0, max: 20}, {left: '0%'}],
        [{min: -20, max: 60}, {left: '25%'}],
    ])('getSeparatorStyle (args: %j)', (args, expected) => {
        const result = getSeparatorStyle(args);
        expect(result).toEqual(expected);
    });

    test.each<[GetMinMaxWithOffsetArgs, {min?: number; max?: number}] /* [args, expected] */>([
        [
            {min: undefined, max: undefined, offset: 0},
            {min: undefined, max: undefined},
        ],
        [
            {min: undefined, max: undefined, offset: 10},
            {min: undefined, max: undefined},
        ],
        [
            {min: undefined, max: 60, offset: 0},
            {min: undefined, max: 60},
        ],
        [
            {min: 0, max: undefined, offset: 0},
            {min: 0, max: undefined},
        ],
        [
            {min: -10, max: 60, offset: 10},
            {min: -20, max: 50},
        ],
        [
            {min: -10, max: 60, offset: -5},
            {min: -5, max: 65},
        ],
    ])('getMinMaxWithOffset (args: %j)', (args, expected) => {
        const result = getMinMaxWithOffset(args);
        expect(result).toEqual(expected);
    });

    test.each<[GetStylesArgs, ReturnType<typeof getStyles>] /* [args, expected] */>([
        [{value: 5, barHeight: '100%', isValid: true, showBar: true}, {barStyle: {height: '100%'}}],
        [{value: 5, barHeight: '100%', isValid: false, showBar: true}, {}],
        [{value: 5, barHeight: '100%', isValid: true, showBar: false}, {}],
        [{value: 5, barHeight: '100%', isValid: false}, {}],
    ])('getStyles (args: %j)', (args, expected) => {
        const result = getStyles(args);
        expect(result).toEqual(expected);
    });

    test.each<[Object, boolean] /* [props, expected] */>([
        [{value: 'not-a-number', debug: false}, false],
        [{value: 5, min: 'not-a-number', max: 10, debug: false}, false],
        [{value: 5, min: -10, max: 'not-a-number', debug: false}, false],
        [{value: 5, min: -10, offset: 'not-a-number', debug: false}, false],
        [{value: 5, debug: false}, false],
        [{value: 5, min: -10, max: -20, debug: false}, false],
        [{value: 5, min: -10, max: -10, debug: false}, false],
        [{value: 5, min: 1, max: 10, debug: false}, false],
        [{value: 5, min: -10, max: -1, debug: false}, false],
        [{value: 5, max: 10, align: 10, debug: false}, false],
        [{value: 5, max: 10, align: 'invalid-align', debug: false}, false],
        [{value: 5, min: -10, offset: -20, debug: false}, false],
        [{value: 5, max: 10, offset: 20, debug: false}, false],
        [{value: 5, min: -10, max: 10, offset: 20, debug: false}, false],
        [{value: 5, min: -10, max: 10, offset: -20, debug: false}, false],
        [{value: 5, min: -10, max: 10, debug: false}, true],
        [{value: 5, min: -10, max: 10, align: 'left', debug: false}, true],
        [{value: 5, min: -10, offset: -5, debug: false}, true],
        [{value: 5, max: 10, offset: 5, debug: false}, true],
        [{value: 5, min: -10, max: 10, offset: 5, debug: false}, true],
    ])('isPropsValid (props: %j)', (props, expected) => {
        const result = isPropsValid(props as BarProps);
        expect(result).toEqual(expected);
    });
});
