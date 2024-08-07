import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.RemoveEmbedUnsetDashHeight,
    state: {
        development: false,
        production: false,
    },
});
