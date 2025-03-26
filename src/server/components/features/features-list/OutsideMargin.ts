import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.OutsideMargin,
    state: {
        development: false,
        production: false,
    },
});
