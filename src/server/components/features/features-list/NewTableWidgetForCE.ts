import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewTableWidgetForCE,
    state: {
        development: true,
        production: true,
    },
});
