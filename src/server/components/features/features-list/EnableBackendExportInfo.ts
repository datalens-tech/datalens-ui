import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableBackendExportInfo,
    state: {
        development: false,
        production: false,
    },
});
