import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDsTemplateParams,
    state: {
        development: true,
        production: false,
    },
});
