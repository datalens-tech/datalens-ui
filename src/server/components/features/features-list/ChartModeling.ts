import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ChartModeling,
    state: {
        development: false,
        production: false,
    },
});
