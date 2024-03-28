import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.PivotTableSortWithTotals,
    state: {
        development: false,
        production: false,
    },
});
