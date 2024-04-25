import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.CustomColorPalettes,
    state: {
        development: true,
        production: true,
    },
});
