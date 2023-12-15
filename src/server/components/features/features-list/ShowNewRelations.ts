import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowNewRelations,
    state: {
        development: true,
        production: false,
    },
});
