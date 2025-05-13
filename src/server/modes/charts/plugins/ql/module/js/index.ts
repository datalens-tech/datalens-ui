import type {IChartEditor, QlConfig} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

import {buildGraph} from './build-graph';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = app.nodekit.ctx.get('getServerFeatures')();
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();
    const qlConnectionTypeMap = registry.getQLConnectionTypeMap();

    return buildGraph({shared, ChartEditor, features, palettes, qlConnectionTypeMap});
};
