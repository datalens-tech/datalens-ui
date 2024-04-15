import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowFilteringChartSetting,
    state: {
        development: true,
        production: true,
    },
});
