import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.FetchDocumentation,
    state: {
        development: false,
        production: false,
    },
});
