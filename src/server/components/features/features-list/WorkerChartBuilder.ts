import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.WorkerChartBuilder,
    state: {
        development: false,
        production: false,
    },
});
