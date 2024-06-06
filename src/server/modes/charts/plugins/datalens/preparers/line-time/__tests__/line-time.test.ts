import type {PrepareFunctionArgs} from '../../types';
import linetimePrepare from '../index';

import {expectedResult, options} from './mocks/line-time.mock';

describe('linetimePrepare', () => {
    describe('monitoring', () => {
        test('monitoring chart with 4 queries should be rendered correctly', () => {
            const result = linetimePrepare(options as unknown as PrepareFunctionArgs);

            expect(result).toEqual(expectedResult);
        });
    });
});
