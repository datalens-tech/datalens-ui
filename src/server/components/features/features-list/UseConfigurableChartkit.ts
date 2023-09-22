import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseConfigurableChartkit,
    state: {
        development: false,
        production: false,
    },
});
