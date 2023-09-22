import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseYqlFolderKey,
    state: {
        development: false,
        production: false,
    },
});
