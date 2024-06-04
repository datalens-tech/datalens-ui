import type {FormDict} from '../../typings';
import {getFormWithTrimmedValues} from '../common';

describe('connections/utils/common', () => {
    test.each<[FormDict, FormDict]>([
        [{}, {}],
        [
            {a: 1, b: true, c: '2', d: [3]},
            {a: 1, b: true, c: '2', d: [3]},
        ],
        [
            {a: '1 ', b: ' 2', c: ' 3 '},
            {a: '1', b: '2', c: '3'},
        ],
    ])('getFormWithTrimmedValues (args: %j)', (target, expected) => {
        const result = getFormWithTrimmedValues(target);
        expect(result).toEqual(expected);
    });
});
