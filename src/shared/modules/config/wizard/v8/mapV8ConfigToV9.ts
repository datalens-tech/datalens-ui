import {WizardVisualizationId} from '../../../../constants';
import type {ServerField, V8ChartsConfig, V9ChartsConfig} from '../../../../types';
import {ChartsConfigVersion, DatasetFieldType} from '../../../../types';

export const mapV8ConfigToV9 = (config: V8ChartsConfig): V9ChartsConfig => {
    let shapes: ServerField[] = config.shapes;

    if (config?.visualization?.id === WizardVisualizationId.Scatter) {
        const colorField = config.colors?.[0];
        if (colorField?.type === DatasetFieldType.Dimension) {
            shapes = [colorField];
        }
    }

    return {
        ...config,
        shapes,
        version: ChartsConfigVersion.V9,
    };
};
