import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EntryMenuEditor,
    state: {
        development: false,
        production: false,
    },
});
