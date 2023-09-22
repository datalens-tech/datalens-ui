import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GenericDatetimeMigration,
    state: {
        development: false,
        production: false,
    },
});
