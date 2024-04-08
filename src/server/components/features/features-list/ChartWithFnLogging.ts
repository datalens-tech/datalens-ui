import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ChartWithFnLogging,
    state: {
        development: false,
        production: false,
    },
});
