import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.HideOldRelations,
    state: {
        development: true,
        production: true,
    },
});
