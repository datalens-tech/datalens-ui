import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.QlAutoExecuteMonitoringChart,
    state: {
        development: false,
        production: false,
    },
});
