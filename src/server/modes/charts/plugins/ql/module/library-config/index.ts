import type {IChartEditor, QlConfig} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

import {buildLibraryConfig} from './build-library-config';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = app.nodekit.ctx.get('getServerFeatures')();
    return buildLibraryConfig({shared, ChartEditor, features});
};
