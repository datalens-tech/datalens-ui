import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.CloudMode,
    state: {
        development: true,
        production: true,
    },
});
