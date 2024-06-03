import type {DialogColorAction, GradientState, PaletteState} from '../actions/dialogColor';
import {
    RESET_DIALOG_COLOR_STATE,
    SET_DIALOG_COLOR_GRADIENT_STATE,
    SET_DIALOG_COLOR_PALETTE_STATE,
} from '../actions/dialogColor';
import {DEFAULT_GRADIENT_STATE, DEFAULT_PALETTE_STATE} from '../constants/dialogColor';

export interface DialogColorState {
    paletteState: PaletteState;
    gradientState: GradientState;
}

const initialState: DialogColorState = {
    paletteState: DEFAULT_PALETTE_STATE,
    gradientState: DEFAULT_GRADIENT_STATE,
};

export function dialogColor(
    state: DialogColorState = initialState,
    action: DialogColorAction,
): DialogColorState {
    switch (action.type) {
        case RESET_DIALOG_COLOR_STATE: {
            return {
                ...initialState,
            };
        }
        case SET_DIALOG_COLOR_PALETTE_STATE: {
            return {
                ...state,
                paletteState: action.paletteState,
            };
        }

        case SET_DIALOG_COLOR_GRADIENT_STATE: {
            return {
                ...state,
                gradientState: action.gradientState,
            };
        }

        default:
            return state;
    }
}
