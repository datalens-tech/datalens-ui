import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.MarkupIndicator,
    state: {
        development: true,
        production: false,
    },
});
