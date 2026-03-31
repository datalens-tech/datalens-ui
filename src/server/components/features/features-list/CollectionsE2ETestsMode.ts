import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.CollectionsE2ETestsMode,
    state: {
        development: true,
        production: true,
    },
});
