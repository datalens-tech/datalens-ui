import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.StatusIllustrations,
    state: {
        development: true,
        production: true,
    },
});
