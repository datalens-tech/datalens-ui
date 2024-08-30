import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ControlBuilder,
    state: {
        development: true,
        production: false,
    },
});
