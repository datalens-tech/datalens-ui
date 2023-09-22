import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.SupportReportEnabled,
    state: {
        development: true,
        production: true,
    },
});
