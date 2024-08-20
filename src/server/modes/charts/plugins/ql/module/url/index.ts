import type {IChartEditor, QlConfig} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

import {buildSources} from './build-sources';

export default function ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) {
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();

    return buildSources({shared, ChartEditor, palettes});
}
