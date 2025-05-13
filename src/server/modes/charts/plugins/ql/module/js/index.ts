import {type IChartEditor, type QlConfig, getServerFeatures} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

import {buildGraph} from './build-graph';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const app = registry.getApp();
    const features = getServerFeatures(app.nodekit.ctx);
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();
    const qlConnectionTypeMap = registry.getQLConnectionTypeMap();

    return buildGraph({shared, ChartEditor, features, palettes, qlConnectionTypeMap});
};
