import {
    DatasetFieldType,
    isMeasureName,
    isMeasureType,
    isMeasureValue,
    isNumberField,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectPalette} from 'ui';

import type {OpenDialogColorArgs} from '../components/Dialogs/DialogColor/DialogColor';
import {VISUALIZATION_IDS} from '../constants';

export const selectDialogColorPaletteState = (state: DatalensGlobalState) =>
    state.wizard.dialogColor.paletteState;

export const selectDialogColorGradientState = (state: DatalensGlobalState) =>
    state.wizard.dialogColor.gradientState;

export const selectClientPaletteColors = (state: DatalensGlobalState) => {
    const {palette} = state.wizard.dialogColor.paletteState;
    const {colorPalettes} = state.colorPaletteEditor;
    const colorPalette = colorPalettes.find((item) => item.colorPaletteId === palette);

    if (colorPalette) {
        return colorPalette.colors;
    }

    return selectPalette(palette);
};

export function isGradientDialog(
    props: Pick<OpenDialogColorArgs['props'], 'item' | 'items' | 'extra'>,
) {
    const {item, items, extra} = props;

    // If items is passed, the mode is equal to DIMENSION
    if (items) {
        return false;
    }

    if (item) {
        // If Measure Names is passed, the mode is equal to DIMENSION
        // If Measure Values is passed, the mode is equal to MEASURE
        if (
            (item.type === 'DIMENSION' || isMeasureName(item)) &&
            extra?.numericDimensionByGradient
        ) {
            return true;
        }

        if (isMeasureType(item) || isMeasureValue(item)) {
            return isNumberField(item);
        }

        if (item.data_type === 'geopoint' || item.cast === 'geopoint') {
            return true;
        }
    }

    return false;
}

const VISUALIZATION_IDS_WITHOUT_COLOR_MODE_CHANGE = new Set<string>([
    VISUALIZATION_IDS.LINE,
    VISUALIZATION_IDS.AREA,
    VISUALIZATION_IDS.AREA_100P,
]);

export function isColorModeChangeAvailable(
    props: Pick<OpenDialogColorArgs['props'], 'item'> & {
        visualizationId: string;
    },
) {
    const {item, visualizationId} = props;

    return (
        item.type === DatasetFieldType.Dimension &&
        isNumberField(item) &&
        !VISUALIZATION_IDS_WITHOUT_COLOR_MODE_CHANGE.has(visualizationId)
    );
}
