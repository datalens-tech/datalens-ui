import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableCustomMonitoring,
    state: {
        development: false,
        production: false,
    },
});
