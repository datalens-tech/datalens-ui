import {ROWS_MAX_COUNT} from '../constants';
import {shouldFetchPreview} from '../utils';

describe('datasets/components/PreviewHeader/utils', () => {
    test.each<[string, boolean]>([
        ['', false],
        ['-1', false],
        ['0', false],
        ['1', true],
        [String(ROWS_MAX_COUNT), true],
        [String(ROWS_MAX_COUNT + 1), false],
    ])('shouldFetchPreview (count: %s)', (count, expected) => {
        const result = shouldFetchPreview(count);
        expect(result).toEqual(expected);
    });
});
