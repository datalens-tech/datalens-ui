import {createSelector} from 'reselect';
import type {ColorPalette} from 'shared';
import type {DatalensGlobalState} from 'ui';

export const selectCurrentColorPalette = (state: DatalensGlobalState) =>
    state.colorPaletteEditor.currentColorPalette;

export const selectColorPalettes = (state: DatalensGlobalState) =>
    state.colorPaletteEditor.colorPalettes;

export const selectColorPalettesDict = createSelector(selectColorPalettes, (colorPalettes) =>
    colorPalettes.reduce(
        (acc: Record<string, ColorPalette>, item) => ({...acc, [item.colorPaletteId]: item}),
        {},
    ),
);
