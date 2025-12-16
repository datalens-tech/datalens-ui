import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableGlobalSelectors,
    state: {
        // TODO: TURN TO FALSE
        development: true,
        production: true,
    },
});
