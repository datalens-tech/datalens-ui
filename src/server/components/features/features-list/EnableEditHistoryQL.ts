import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableEditHistoryQL,
    state: {
        development: true,
        production: false,
    },
});
