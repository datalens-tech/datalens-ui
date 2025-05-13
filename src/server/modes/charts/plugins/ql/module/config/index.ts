import {type IChartEditor, getServerFeatures} from '../../../../../../../shared';
import type {QlConfig} from '../../../../../../../shared/types/config/ql';
import {registry} from '../../../../../../registry';

import {buildChartConfig} from './build-chart-config';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = getServerFeatures(app.nodekit.ctx);

    return buildChartConfig({shared, ChartEditor, features});
};
