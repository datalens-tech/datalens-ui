import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.Ql,
    state: {
        development: true,
        production: true,
    },
});
