import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashBoardWidgetParamsStrictValidation,
    state: {
        development: true,
        production: true,
    },
});
