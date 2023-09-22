import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ExternalSelectors,
    state: {
        development: false,
        production: false,
    },
});
