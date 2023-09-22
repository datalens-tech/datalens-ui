import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewMobileDesign,
    state: {
        development: false,
        production: false,
    },
});
