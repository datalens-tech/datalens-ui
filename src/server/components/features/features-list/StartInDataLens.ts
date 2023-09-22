import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.StartInDataLens,
    state: {
        development: true,
        production: true,
    },
});
