import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableChartEditor,
    state: {
        development: true,
        production: false,
    },
});
