import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.HelpCenterEnabled,
    state: {
        development: true,
        production: true,
    },
});
