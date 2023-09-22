import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GSheetGoogleAuthEnabled,
    state: {
        development: true,
        production: true,
    },
});
