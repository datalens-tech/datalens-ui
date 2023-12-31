import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashBoardAccessDescription,
    state: {
        development: true,
        production: true,
    },
});
