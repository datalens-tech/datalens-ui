import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnablePublishEntry,
    state: {
        development: false,
        production: false,
    },
});
