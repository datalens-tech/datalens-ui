import type {IChartEditor, QlConfig} from '../../../../../../../shared';
import {getServerFeatures} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

import {buildLibraryConfig} from './build-library-config';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = getServerFeatures(app.nodekit.ctx);
    return buildLibraryConfig({shared, ChartEditor, features});
};
