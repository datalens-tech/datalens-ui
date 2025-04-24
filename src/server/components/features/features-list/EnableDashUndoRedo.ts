import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDashUndoRedo,
    state: {
        development: true,
        production: false,
    },
});
