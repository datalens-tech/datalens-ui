import type {PrepareFunctionArgs} from '../../types';
import {prepareHighchartsPie} from '../highcharts';

import {piePrepareForQLArgs, piePrepareForQLResult} from './mocks/pie.mock';

describe('prepareHighchartsPie', () => {
    describe('ql', () => {
        test('should render simple pie correctly', () => {
            const result = prepareHighchartsPie(
                piePrepareForQLArgs as unknown as PrepareFunctionArgs,
            );

            expect(result).toEqual(piePrepareForQLResult);
        });
    });
});
