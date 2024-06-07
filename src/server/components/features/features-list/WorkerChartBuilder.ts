import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

/**
 * Enable Dash ActionPanel drag'n'drop functionality
 */
export default createFeatureConfig({
    name: Feature.WorkerChartBuilder,
    state: {
        development: true,
        production: false,
    },
});
