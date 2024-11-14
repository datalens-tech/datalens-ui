import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.TableSize,
    state: {
        development: true,
        production: false,
    },
});
