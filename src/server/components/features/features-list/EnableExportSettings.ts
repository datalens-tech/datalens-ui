import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableExportSettings,
    state: {
        development: true,
        production: false,
    },
});
