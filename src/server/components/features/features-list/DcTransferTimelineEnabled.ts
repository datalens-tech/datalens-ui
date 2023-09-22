import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DcTransferTimelineEnabled,
    state: {
        development: false,
        production: false,
    },
});
