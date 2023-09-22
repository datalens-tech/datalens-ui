import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.BackofficeBanner,
    state: {
        development: true,
        production: true,
    },
});
