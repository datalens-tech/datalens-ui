import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableFavoritesNameAliases,
    state: {
        development: false,
        production: false,
    },
});
