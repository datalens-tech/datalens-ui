import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UsDynamicMasterToken,
    state: {
        development: true,
        production: false,
    },
});
