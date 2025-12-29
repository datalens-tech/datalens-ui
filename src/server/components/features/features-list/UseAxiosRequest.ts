import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseAxiosRequest,
    state: {
        development: true,
        production: true,
    },
});
