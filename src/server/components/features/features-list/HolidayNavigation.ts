import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.HolidayNavigation,
    state: {
        development: false,
        production: false,
    },
});
