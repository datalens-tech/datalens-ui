import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashBoardSupportDescription,
    state: {
        development: false,
        production: false,
    },
});
