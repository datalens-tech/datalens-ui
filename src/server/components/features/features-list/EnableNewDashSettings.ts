import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableNewDashSettings,
    state: {
        development: true,
        production: false,
    },
});
