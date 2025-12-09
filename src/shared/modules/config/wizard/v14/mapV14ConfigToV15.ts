import {ChartsConfigVersion} from '../../../../types';
import type {V14ChartsConfig} from '../../../../types/config/wizard/v14';
import type {V15ChartsConfig} from '../../../../types/config/wizard/v15';
import {mapD3VisualizationsToStandartOnes} from '../../utils';

export const mapV14ConfigToV15 = (config: V14ChartsConfig): V15ChartsConfig => {
    const newVisuzalization = config.visualization
        ? {
              ...config.visualization,
              id: mapD3VisualizationsToStandartOnes(config.visualization?.id),
          }
        : config.visualization;

    return {
        ...config,
        visualization: newVisuzalization,
        version: ChartsConfigVersion.V15,
    };
};
