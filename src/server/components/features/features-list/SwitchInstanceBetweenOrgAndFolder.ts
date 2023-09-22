import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.SwitchInstanceBetweenOrgAndFolder,
    state: {
        development: true,
        production: true,
    },
});
