import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.PreWrapTableSetting,
    state: {
        development: false,
        production: false,
    },
});
