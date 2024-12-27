import {getSdk} from 'libs/schematic-sdk';
import type {ColorPalette} from 'shared';
import type {DatalensGlobalState, DataLensApiError} from 'index';
import type {OpenDialogConfirmArguments} from './dialog';
import {closeDialog, openDialogConfirm} from './dialog';
import type {AppDispatch} from 'store';
import {I18n} from 'i18n';
import {showToast} from './toaster';

const i18n = I18n.keyset('component.color-palette-editor');

export const SET_CURRENT_COLOR_PALETTE = Symbol(
    'wizard/colorPaletteEditor/SET_CURRENT_COLOR_PALETTE',
);

export const SET_COLOR_PALETTES = Symbol('wizard/colorPaletteEditor/SET_COLOR_PALETTES');

interface SetCurrentColorPalette {
    type: typeof SET_CURRENT_COLOR_PALETTE;
    colorPalette?: ColorPalette;
}

export function setCurrentColorPalette(
    colorPalette: ColorPalette | undefined,
): SetCurrentColorPalette {
    return {
        type: SET_CURRENT_COLOR_PALETTE,
        colorPalette,
    };
}

interface SetColorPalettes {
    type: typeof SET_COLOR_PALETTES;
    colorPalettes: ColorPalette[];
}

export function setColorPalettes(colorPalettes: ColorPalette[]): SetColorPalettes {
    return {
        type: SET_COLOR_PALETTES,
        colorPalettes,
    };
}

export function fetchColorPalettes() {
    return async (dispatch: AppDispatch) => {
        try {
            const colorPalettes = await getSdk().sdk.us.getColorPalettesList();

            dispatch(setColorPalettes(colorPalettes));
        } catch (e) {
            console.error(e);
        }
    };
}

export function saveCurrentPalette() {
    return async (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const {currentColorPalette} = getState().colorPaletteEditor;

        if (!currentColorPalette) {
            return;
        }

        let operationPromise;

        const isUpdateAction = currentColorPalette.colorPaletteId;

        if (isUpdateAction) {
            operationPromise = getSdk().sdk.us.updateColorPalette(currentColorPalette);
        } else {
            operationPromise = getSdk().sdk.us.createColorPalette({
                displayName: currentColorPalette.displayName,
                colors: currentColorPalette.colors,
                isDefault: currentColorPalette.isDefault,
                isGradient: currentColorPalette.isGradient,
            });
        }

        try {
            await operationPromise;
        } catch (error) {
            const title = isUpdateAction
                ? i18n('toast_update-failed')
                : i18n('toast_create-failed');
            const name = isUpdateAction ? 'UpdateColorPaletteFailed' : 'CreateColorPaletteFailed';

            dispatch(
                showToast({
                    title,
                    name,
                    error: error as DataLensApiError,
                }),
            );

            return;
        }

        await dispatch(fetchColorPalettes());

        dispatch(setCurrentColorPalette(undefined));
    };
}

export function deleteColorPalette(colorPalette: ColorPalette) {
    return async (dispatch: AppDispatch) => {
        const {colorPaletteId} = colorPalette;

        if (!colorPaletteId) {
            return;
        }

        try {
            await getSdk().sdk.us.deleteColorPalette({
                colorPaletteId,
            });
        } catch (error) {
            dispatch(
                showToast({
                    title: i18n('toast_delete-failed'),
                    name: 'DeleteColorPaletteFailed',
                    error: error as DataLensApiError,
                }),
            );

            return;
        }

        dispatch(setCurrentColorPalette(undefined));

        await dispatch(fetchColorPalettes());
    };
}

type OpenDialogSaveChartConfirmArguments = Pick<OpenDialogConfirmArguments, 'onApply'>;

export const openDeletePaletteConfirm = ({onApply}: OpenDialogSaveChartConfirmArguments) => {
    return function (dispatch: AppDispatch) {
        const openDialogConfirmParams: OpenDialogConfirmArguments = {
            onApply: (args) => {
                onApply(args);
                dispatch(closeDialog());
            },
            message: i18n('label_delete-message'),
            isWarningConfirm: true,
            cancelButtonView: 'flat',
            confirmButtonView: 'outlined-danger',
            showIcon: false,
            onCancel: () => dispatch(closeDialog()),
            widthType: 'medium',
            confirmHeaderText: i18n('button_delete-title'),
            cancelButtonText: i18n('button_delete-cancel'),
            confirmButtonText: i18n('button_delete-confirm'),
        };

        dispatch(openDialogConfirm(openDialogConfirmParams));
    };
};

export type ColorPaletteEditorAction = SetCurrentColorPalette | SetColorPalettes;
