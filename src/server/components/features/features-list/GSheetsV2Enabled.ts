import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GSheetsV2Enabled,
    state: {
        development: true,
        production: true,
    },
});
