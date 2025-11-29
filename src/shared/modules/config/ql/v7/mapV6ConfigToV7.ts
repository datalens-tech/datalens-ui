import type {QlConfigV6} from '../../../../types/config/ql/v6';
import type {QlConfigV7} from '../../../../types/config/ql/v7';
import {QlConfigVersions} from '../../../../types/ql/versions';
import {mapD3VisualizationsToStandartOnes} from '../../utils';

export const mapV6ConfigToV7 = (config: QlConfigV6): QlConfigV7 => {
    const newVisualization = {...config.visualization};
    newVisualization.id = mapD3VisualizationsToStandartOnes(config.visualization?.id);

    return {
        ...config,
        visualization: newVisualization,
        version: QlConfigVersions.V7,
    };
};
