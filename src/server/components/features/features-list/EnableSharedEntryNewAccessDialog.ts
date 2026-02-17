import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableSharedEntryNewAccessDialog,
    state: {
        development: false,
        production: false,
    },
});
