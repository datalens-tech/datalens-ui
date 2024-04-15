import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ExternalSelectors,
    state: {
        development: true,
        production: false,
    },
});
