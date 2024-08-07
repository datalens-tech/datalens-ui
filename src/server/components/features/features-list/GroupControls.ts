import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GroupControls,
    state: {
        development: true,
        production: true,
    },
});
