import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GenericDatetime,
    state: {
        development: false,
        production: false,
    },
});
