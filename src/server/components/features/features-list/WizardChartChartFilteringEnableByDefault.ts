import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.WizardChartChartFilteringEnableByDefault,
    state: {
        development: false,
        production: false,
    },
});
