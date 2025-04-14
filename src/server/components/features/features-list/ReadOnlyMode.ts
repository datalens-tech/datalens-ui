import {Feature, isTrueArg} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ReadOnlyMode,
    state: {
        development: false,
        production: isTrueArg(process.env.READ_ONLY_MODE),
    },
});
