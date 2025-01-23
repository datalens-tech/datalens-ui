import {chartValidator} from '../chart-validator';

import {validDataChunks} from './mocks/chart-validator';

describe('Charts Engine chartValidator', () => {
    test.each([...validDataChunks])('should return true %j', (data) => {
        expect(chartValidator.validate(data)).toBeTruthy();
    });
});
