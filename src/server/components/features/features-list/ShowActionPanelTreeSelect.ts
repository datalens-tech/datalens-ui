import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowActionPanelTreeSelect,
    state: {
        development: false,
        production: false,
    },
});
