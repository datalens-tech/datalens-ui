import type {ColorsConfig, Field, GradientNullMode, GradientType, PartialBy} from 'shared';
import {selectAvailableClientGradients} from 'shared/constants/gradients';
import {closeDialog, openDialog} from 'store/actions/dialog';
import type {DatalensGlobalState} from 'ui';

import type {OpenDialogColorArgs} from '../components/Dialogs/DialogColor/DialogColor';
import {DIALOG_COLOR} from '../components/Dialogs/DialogColor/DialogColor';
import {DEFAULT_GRADIENT_MODE, DEFAULT_TWO_POINT_GRADIENT} from '../constants/dialogColor';
import type {WizardDispatch} from '../reducers';
import {
    selectDialogColorGradientState,
    selectDialogColorPaletteState,
} from '../selectors/dialogColor';

export interface PaletteState {
    mountedColors: Record<string, string>;
    palette: string;
    selectedValue: string | null;
    polygonBorders: string;
}

export interface ValidationStatus {
    left?: {
        text: string;
    };
    middle?: {
        text: string;
    };
    right?: {
        text: string;
    };
}

export interface GradientState {
    reversed: boolean;
    gradientMode: GradientType;
    polygonBorders: string;
    thresholdsMode: string;
    leftThreshold?: string;
    middleThreshold?: string;
    rightThreshold?: string;
    gradientPalette: string;
    validationStatus?: ValidationStatus;
    nullMode?: GradientNullMode;
}

export const RESET_DIALOG_COLOR_STATE = Symbol('wizard/dialogColor/RESET_DIALOG_COLOR_STATE');
export const SET_DIALOG_COLOR_PALETTE_STATE = Symbol(
    'wizard/dialogColor/SET_DIALOG_COLOR_PALETTE_STATE',
);
export const SET_DIALOG_COLOR_GRADIENT_STATE = Symbol(
    'wizard/dialogColor/SET_DIALOG_COLOR_GRADIENT_STATE',
);

interface SetDialogColorGradientState {
    type: typeof SET_DIALOG_COLOR_GRADIENT_STATE;
    gradientState: GradientState;
}

export function setDialogColorGradientState(
    gradientState: GradientState,
): SetDialogColorGradientState {
    return {
        type: SET_DIALOG_COLOR_GRADIENT_STATE,
        gradientState,
    };
}

interface SetDialogColorPaletteState {
    type: typeof SET_DIALOG_COLOR_PALETTE_STATE;
    paletteState: PaletteState;
}

export function setDialogColorPaletteState(paletteState: PaletteState): SetDialogColorPaletteState {
    return {
        type: SET_DIALOG_COLOR_PALETTE_STATE,
        paletteState,
    };
}

interface ResetDialogColorState {
    type: typeof RESET_DIALOG_COLOR_STATE;
}

export function resetDialogColorState(): ResetDialogColorState {
    return {
        type: RESET_DIALOG_COLOR_STATE,
    };
}

export function openDialogColor(props: PartialBy<OpenDialogColorArgs['props'], 'onCancel'>) {
    return function (dispatch: WizardDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_COLOR,
                props: {
                    ...props,
                    onCancel: () => {
                        if (props.onCancel) {
                            props.onCancel();
                        }

                        dispatch(closeDialog());
                    },
                },
            }),
        );
    };
}

export function prepareDialogColorState(props: {
    colorsConfig: ColorsConfig | undefined;
    items?: Field[];
}) {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const state = getState();
        const {colorsConfig} = props;

        const defaultPaletteState = selectDialogColorPaletteState(state);
        const defaultGradientState = selectDialogColorGradientState(state);

        const palette = colorsConfig?.palette || defaultPaletteState.palette;

        const isReversedDefined = typeof colorsConfig?.reversed === 'boolean';

        const paletteState: PaletteState = {
            mountedColors: colorsConfig?.mountedColors || defaultPaletteState.mountedColors,
            palette,
            polygonBorders: colorsConfig?.polygonBorders || defaultPaletteState.polygonBorders,
            selectedValue: defaultPaletteState.selectedValue,
        };

        const gradientState: GradientState = {
            reversed: isReversedDefined
                ? Boolean(colorsConfig?.reversed)
                : defaultGradientState.reversed,
            gradientMode: colorsConfig?.gradientMode || defaultGradientState.gradientMode,
            polygonBorders: colorsConfig?.polygonBorders || defaultGradientState.polygonBorders,
            thresholdsMode: colorsConfig?.thresholdsMode || defaultGradientState.thresholdsMode,
            leftThreshold: colorsConfig?.leftThreshold || defaultGradientState.leftThreshold,
            middleThreshold: colorsConfig?.middleThreshold || defaultGradientState.middleThreshold,
            rightThreshold: colorsConfig?.rightThreshold || defaultGradientState.rightThreshold,
            gradientPalette: colorsConfig?.gradientPalette || defaultGradientState.gradientPalette,
            nullMode: colorsConfig?.nullMode || defaultGradientState.nullMode,
        };

        const gradients = selectAvailableClientGradients(getState(), gradientState.gradientMode);
        const gradientId = gradientState.gradientPalette;

        const isGradientSelected = gradients[gradientId];

        if (!isGradientSelected) {
            gradientState.gradientPalette = DEFAULT_TWO_POINT_GRADIENT;
            gradientState.gradientMode = DEFAULT_GRADIENT_MODE;
        }

        if (props.items) {
            const {items} = props;
            const values = [...new Set(items.map((item) => item.fakeTitle || item.title))];

            paletteState.selectedValue = values[0] || null;
        }

        dispatch(setDialogColorGradientState(gradientState));
        dispatch(setDialogColorPaletteState(paletteState));
    };
}

export type DialogColorAction =
    | ResetDialogColorState
    | SetDialogColorPaletteState
    | SetDialogColorGradientState;
