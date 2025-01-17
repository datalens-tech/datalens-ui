import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableFileUploadingByPresignedUrl,
    state: {
        development: true,
        production: false,
    },
});
