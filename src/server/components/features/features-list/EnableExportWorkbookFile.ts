import {Feature, isTrueArg} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableExportWorkbookFile,
    state: {
        development: isTrueArg(process.env.EXPORT_WORKBOOK_ENABLED),
        production: isTrueArg(process.env.EXPORT_WORKBOOK_ENABLED),
    },
});
