import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseChartsEngineResponseConfig,
    state: {
        development: false,
        production: false,
    },
});
