import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableChartEditorDocs,
    state: {
        development: false,
        production: false,
    },
});
