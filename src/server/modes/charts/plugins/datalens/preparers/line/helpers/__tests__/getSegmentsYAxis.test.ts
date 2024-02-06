import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import {WizardVisualizationId} from '../../../../../../../../../shared';
import {getSegmentsYAxis} from '../segments/getSegmentsYAxis';
import {SegmentsMap} from '../segments/types';

describe('getSegmentsYAxis', () => {
    it('The position of a segment(top) depends on its index', () => {
        const segmentMap: SegmentsMap = {
            a: {index: 1, title: 'a', isOpposite: false},
            b: {index: 0, title: 'b', isOpposite: false},
        };
        const actual = getSegmentsYAxis(
            segmentMap,
            {},
            WizardVisualizationId.Column,
        ).yAxisSettings.map((s) => ({
            top: (s as Highcharts.YAxisOptions).top,
            title: s.title?.text,
        }));

        expect(actual).toEqual([
            {top: '0%', title: 'b'},
            {top: '52%', title: 'a'},
        ]);
    });
});
