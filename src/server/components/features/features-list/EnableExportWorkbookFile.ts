import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableExportWorkbookFile,
    state: {
        development: false,
        production: false,
    },
});
