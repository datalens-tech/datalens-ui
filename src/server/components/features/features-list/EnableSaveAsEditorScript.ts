import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableSaveAsEditorScript,
    state: {
        development: false,
        production: false,
    },
});
