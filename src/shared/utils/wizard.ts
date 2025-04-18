import {WizardVisualizationId} from '../constants';
import type {ExtendedChartsConfig, VisualizationWithLayersShared} from '../types';

export function isVisualizationWithLayers(
    visualization: ExtendedChartsConfig['visualization'] | undefined,
): visualization is VisualizationWithLayersShared['visualization'] {
    return [WizardVisualizationId.Geolayer, WizardVisualizationId.CombinedChart].includes(
        visualization?.id as WizardVisualizationId,
    );
}

export function mapStringToCoordinates(value: string) {
    return value
        .split(',')
        .map((val) => {
            const res = Number(val);
            if (Number.isNaN(res)) {
                return null;
            }

            return res;
        })
        .filter(Boolean) as number[];
}

export function validateCoordinatesValue(value: string) {
    let coordinates = [];

    try {
        coordinates = mapStringToCoordinates(value);
    } catch (e) {
        return false;
    }

    return coordinates.length === 2;
}
