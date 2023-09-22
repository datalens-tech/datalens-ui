import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.FieldEditorDocSection,
    state: {
        development: false,
        production: false,
    },
});
