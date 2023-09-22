import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.XlsxFilesEnabled,
    state: {
        development: true,
        production: true,
    },
});
