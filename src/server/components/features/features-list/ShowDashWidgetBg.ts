import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowDashWidgetBg,
    state: {
        development: true,
        production: false,
    },
});
