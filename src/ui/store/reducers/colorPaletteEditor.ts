import type {ColorPaletteEditorAction} from '../actions/colorPaletteEditor';
import {SET_COLOR_PALETTES, SET_CURRENT_COLOR_PALETTE} from '../actions/colorPaletteEditor';
import type {ResetWizardStoreAction} from '../../units/wizard/actions';
import type {ColorPalette} from 'shared';

export interface ColorPaletteEditorState {
    colorPalettes: ColorPalette[];
    currentColorPalette: ColorPalette | undefined;
}

const getInitialState = (): ColorPaletteEditorState => ({
    colorPalettes: [],
    currentColorPalette: undefined,
});

export default function colorPaletteEditor(
    state: ColorPaletteEditorState = getInitialState(),
    action: ColorPaletteEditorAction | ResetWizardStoreAction,
): ColorPaletteEditorState {
    switch (action.type) {
        case SET_CURRENT_COLOR_PALETTE: {
            return {
                ...state,
                currentColorPalette: action.colorPalette,
            };
        }
        case SET_COLOR_PALETTES: {
            return {
                ...state,
                colorPalettes: action.colorPalettes,
            };
        }
        default:
            return state;
    }
}
