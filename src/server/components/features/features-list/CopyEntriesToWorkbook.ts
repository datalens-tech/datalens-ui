import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.CopyEntriesToWorkbook,
    state: {
        development: true,
        production: true,
    },
});
