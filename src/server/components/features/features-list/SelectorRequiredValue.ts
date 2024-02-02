import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.SelectorRequiredValue,
    state: {
        development: true,
        production: true,
    },
});
