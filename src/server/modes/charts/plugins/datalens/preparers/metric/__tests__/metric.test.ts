import type {PrepareFunctionArgs} from '../../types';
import prepareMetric from '../index';

import {metricPrepareForQLArgs, metricPrepareForQLResult} from './mocks/metric.mock';

describe('prepareMetric', () => {
    describe('ql', () => {
        test('should render simple metric correctly', () => {
            const result = prepareMetric(metricPrepareForQLArgs as unknown as PrepareFunctionArgs);

            expect(result).toEqual(metricPrepareForQLResult);
        });
    });
});
