import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.YMapV3ForWizard,
    state: {
        development: false,
        production: false,
    },
});
