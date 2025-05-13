import type {IChartEditor} from '../../../../../../../shared';
import type {QlConfig} from '../../../../../../../shared/types/config/ql';
import {registry} from '../../../../../../registry';

import {buildChartConfig} from './build-chart-config';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = app.nodekit.ctx.get('getServerFeatures')();

    return buildChartConfig({shared, ChartEditor, features});
};
