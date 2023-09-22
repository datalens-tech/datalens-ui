import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ShowCreateEntryWithMenu,
    state: {
        development: false,
        production: false,
    },
});
