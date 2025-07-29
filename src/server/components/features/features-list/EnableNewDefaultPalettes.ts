import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableNewDefaultPalettes,
    state: {
        development: false,
        production: false,
    },
});
