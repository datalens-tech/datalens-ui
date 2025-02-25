import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowNewRelationsButton,
    state: {
        development: true,
        production: false,
    },
});
