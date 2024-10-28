import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.TableDensity,
    state: {
        development: true,
        production: true,
    },
});
