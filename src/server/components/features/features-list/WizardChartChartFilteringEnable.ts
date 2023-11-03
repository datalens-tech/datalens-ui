import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.WizardChartChartFilteringEnable,
    state: {
        development: false,
        production: false,
    },
});
