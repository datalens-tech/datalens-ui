import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.PivotTableMeasureNames,
    state: {
        development: false,
        production: false,
    },
});
