import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.HideMultiDatasets,
    state: {
        development: true,
        production: true,
    },
});
