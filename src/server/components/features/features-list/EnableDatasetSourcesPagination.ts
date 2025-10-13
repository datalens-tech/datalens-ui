import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDatasetSourcesPagination,
    state: {
        development: true,
        production: false,
    },
});
