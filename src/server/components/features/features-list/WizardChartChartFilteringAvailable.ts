import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.WizardChartChartFilteringAvailable,
    state: {
        development: true,
        production: true,
    },
});
