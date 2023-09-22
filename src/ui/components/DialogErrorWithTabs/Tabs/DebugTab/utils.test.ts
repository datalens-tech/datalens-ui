import {hasAtLeastOneFilledValue} from './utils';

describe('ui/components/DialogErrorWithTabs/Tabs/DebugTab', () => {
    test.each<[any, boolean]>([
        [undefined, false],
        [null, false],
        [{}, false],
        [{a: {}}, false],
        [{a: {b: {}}}, false],
        [{a: {b: {c: {}}}}, false],
        [{a: {b: {c: {}}}}, false],
        ['val', true],
        [{a: 'val'}, true],
        [{a: {b: {}}, c: 'val'}, true],
        [{a: {b: {}, c: 'val'}}, true],
        [{a: {b: {c: 'val'}}}, true],
    ])('hasAtLeastOneFilledValue (args:%j)', (target, expected) => {
        const result = hasAtLeastOneFilledValue(target);
        expect(result).toBe(expected);
    });
});
