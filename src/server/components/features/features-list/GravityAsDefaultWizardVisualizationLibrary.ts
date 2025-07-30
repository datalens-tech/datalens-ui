import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GravityAsDefaultWizardVisualizationLibrary,
    state: {
        development: false,
        production: false,
    },
});
