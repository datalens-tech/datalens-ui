import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
// import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogMetricColorsQa} from 'shared';
import {getColorByColorSettings} from 'shared/utils/palettes';
import {selectColorPalettes} from 'ui/store/selectors/colorPaletteEditor';
import {getPaletteColors} from 'ui/utils';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectExtraSettings} from '../../../selectors/widget';
import {MinifiedPalette} from '../../MinifiedPalette/MinifiedPalette';

import './DialogMetricColors.scss';

// const i18n = I18n.keyset('wizard');

const i18nKeys = {
    'label_color-settings': 'label_color-settings',
    section_color: 'section_color',
    button_apply: 'button_apply',
    button_cancel: 'button_cancel',
};
const i18n = (key: keyof typeof i18nKeys) => i18nKeys[key];

const b = block('dialog-metric-colors');

type OwnProps = {
    onApply: (args: {palette?: string; color: string; colorIndex?: number}) => void;
};

export const DIALOG_METRIC_COLORS = Symbol('DIALOG_METRIC_COLORS');

export type OpenDialogMetricColorsArgs = {
    id: typeof DIALOG_METRIC_COLORS;
    props: OwnProps;
};

const DialogMetricColors: React.FC<OwnProps> = ({onApply}) => {
    const dispatch = useDispatch();

    const extraSettings = useSelector(selectExtraSettings);
    const colorPalettes = useSelector(selectColorPalettes);

    const [state, setState] = React.useState(() => {
        const palette = extraSettings?.metricFontColorPalette;
        const paletteColors = getPaletteColors(palette, colorPalettes);

        const metricFontColor = extraSettings?.metricFontColor;
        const metricFontColorIndex = extraSettings?.metricFontColorIndex;

        // if font settings is empty take index 0 by default
        const defaultIndex = metricFontColor ? undefined : 0;

        return {
            currentColorHex: getColorByColorSettings({
                currentColors: paletteColors,
                colorIndex: metricFontColorIndex,
                color: metricFontColor,
            }),
            palette,
            colorIndex: metricFontColorIndex ?? defaultIndex,
            paletteColors,
            hasErrors: false,
        };
    });

    const handleInputColorUpdate = React.useCallback((colorHex: string) => {
        setState((prev) => ({...prev, currentColorHex: colorHex, colorIndex: undefined}));
    }, []);

    const handlePaletteUpdate = React.useCallback(
        (paletteName: string | undefined) => {
            const updatedColors = getPaletteColors(paletteName, colorPalettes);
            const newColor = updatedColors[0];
            setState((prev) => ({
                ...prev,
                palette: paletteName,
                currentColorHex: newColor,
                colorIndex: 0,
                paletteColors: updatedColors,
            }));
        },
        [colorPalettes],
    );

    const handlePaletteValidChange = React.useCallback((valid: boolean) => {
        setState((prev) => ({...prev, hasErrors: !valid}));
    }, []);

    const handlePaletteItemClick = React.useCallback((value: string) => {
        setState((prev) => {
            const colorIndex = prev.paletteColors.indexOf(value);
            return {
                ...prev,
                currentColorHex: value,
                colorIndex,
            };
        });
    }, []);

    const handleApply = React.useCallback(() => {
        const {currentColorHex, palette, colorIndex} = state;
        onApply({color: currentColorHex, palette, colorIndex});
        dispatch(closeDialog());
    }, [state, onApply, dispatch]);

    const handleClose = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            disableHeightTransition={true}
            qa={DialogMetricColorsQa.Dialog}
        >
            <Dialog.Header caption={i18n('label_color-settings')} />
            <Dialog.Body className={b()}>
                <div className={b('row')}>
                    <div className={b('title')}>{i18n('section_color')}</div>
                    <div className={b('palette')}>
                        <MinifiedPalette
                            onPaletteUpdate={handlePaletteUpdate}
                            onPaletteItemClick={handlePaletteItemClick}
                            palette={state.palette ?? ''}
                            currentColorHex={state.currentColorHex}
                            controlQa="dialog-metric-settings-palette"
                            onInputColorUpdate={handleInputColorUpdate}
                            colorPalettes={colorPalettes}
                            customColorSelected={typeof state.colorIndex !== 'number'}
                            customColorBtnQa={DialogMetricColorsQa.CustomColorButton}
                            onValidChange={handlePaletteValidChange}
                        />
                    </div>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={handleApply}
                textButtonApply={i18n('button_apply')}
                propsButtonApply={{qa: DialogMetricColorsQa.ApplyButton, disabled: state.hasErrors}}
                onClickButtonCancel={handleClose}
                textButtonCancel={i18n('button_cancel')}
                propsButtonCancel={{qa: DialogMetricColorsQa.CancelButton}}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_METRIC_COLORS, DialogMetricColors);
