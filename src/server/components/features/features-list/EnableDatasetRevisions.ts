import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDatasetRevisions,
    state: {
        development: true,
        production: false,
    },
});
