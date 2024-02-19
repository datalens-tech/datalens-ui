import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableServerlessEditor,
    state: {
        development: false,
        production: false,
    },
});
