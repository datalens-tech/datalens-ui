import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableEditHistoryDatasets,
    state: {
        development: true,
        production: false,
    },
});
