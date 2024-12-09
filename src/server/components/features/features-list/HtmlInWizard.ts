import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.HtmlInWizard,
    state: {
        development: false,
        production: false,
    },
});
