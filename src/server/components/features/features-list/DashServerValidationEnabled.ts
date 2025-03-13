import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashServerValidationEnable,
    state: {
        development: true,
        production: false,
    },
});
