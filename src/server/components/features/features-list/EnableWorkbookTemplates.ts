import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableWorkbookTemplates,
    state: {
        development: true,
        production: true,
    },
});
