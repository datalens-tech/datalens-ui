import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableUpdatingDsSettingsByAction,
    state: {
        development: true,
        production: false,
    },
});
