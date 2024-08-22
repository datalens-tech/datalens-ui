import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.QlChartRunner,
    state: {
        development: true,
        production: false,
    },
});
