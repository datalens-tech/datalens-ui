import React from 'react';

import {i18n} from 'i18n';
import type {ColorPalette, Field, TableBarsSettings} from 'shared';
import {BarsColorType, DialogFieldBarsSettingsQa} from 'shared';

import {DialogFieldRow} from '../../../DialogFieldRow/DialogFieldRow';
import {GradientColorControl} from '../GradientColorControl/GradientColorControl';
import {PaletteColorControl} from '../PaletteColorControl/PaletteColorControl';

type ColorsControlProps = {
    onUpdateColor: (colorSettings: Partial<TableBarsSettings['colorSettings']['settings']>) => void;
    onUpdatePalette: (palette: string) => void;
    colorSettings: TableBarsSettings['colorSettings'];
    disabled: boolean;
    onError: (error: boolean) => void;
    field: Field;
    colorPalettes: ColorPalette[];
};

export const ColorsControl: React.FC<ColorsControlProps> = (props: ColorsControlProps) => {
    const {onUpdateColor, colorSettings, onUpdatePalette, onError, disabled, field, colorPalettes} =
        props;

    const selectedPalette = colorSettings.settings.palette ?? '';

    switch (colorSettings.colorType) {
        case BarsColorType.OneColor: {
            return (
                <DialogFieldRow
                    customMarginBottom="25px"
                    title={i18n('wizard', 'label_bars-color')}
                    setting={
                        <PaletteColorControl
                            palette={selectedPalette}
                            controlQa={DialogFieldBarsSettingsQa.ColorSelector}
                            currentColorHex={colorSettings.settings.color}
                            currentColorIndex={colorSettings.settings.colorIndex}
                            onPaletteItemChange={(color, index?: number) =>
                                onUpdateColor({colorIndex: index, color})
                            }
                            onPaletteUpdate={onUpdatePalette}
                            onError={onError}
                            disabled={disabled}
                            colorPalettes={colorPalettes}
                        />
                    }
                />
            );
        }
        case BarsColorType.TwoColor: {
            return (
                <React.Fragment>
                    <DialogFieldRow
                        title={i18n('wizard', 'label_bars-positive-color')}
                        setting={
                            <PaletteColorControl
                                palette={selectedPalette}
                                controlQa={DialogFieldBarsSettingsQa.PositiveColorSelector}
                                currentColorHex={colorSettings.settings.positiveColor}
                                currentColorIndex={colorSettings.settings.positiveColorIndex}
                                defaultColorIndex={2}
                                onPaletteItemChange={(color, index?: number) =>
                                    onUpdateColor({positiveColorIndex: index, positiveColor: color})
                                }
                                onPaletteUpdate={onUpdatePalette}
                                onError={onError}
                                disabled={disabled}
                                colorPalettes={colorPalettes}
                            />
                        }
                    />
                    <DialogFieldRow
                        customMarginBottom="25px"
                        title={i18n('wizard', 'label_bars-negative-color')}
                        setting={
                            <PaletteColorControl
                                palette={selectedPalette}
                                controlQa={DialogFieldBarsSettingsQa.NegativeColorSelector}
                                currentColorHex={colorSettings.settings.negativeColor}
                                currentColorIndex={colorSettings.settings.negativeColorIndex}
                                defaultColorIndex={1}
                                onPaletteItemChange={(color: string, index?: number) => {
                                    onUpdateColor({
                                        negativeColorIndex: index,
                                        negativeColor: color,
                                    });
                                }}
                                onPaletteUpdate={onUpdatePalette}
                                onError={onError}
                                disabled={disabled}
                                colorPalettes={colorPalettes}
                            />
                        }
                    />
                </React.Fragment>
            );
        }
        case BarsColorType.Gradient:
            return (
                <DialogFieldRow
                    title={i18n('wizard', 'label_palette')}
                    customMarginBottom="12px"
                    setting={
                        <GradientColorControl
                            qa={DialogFieldBarsSettingsQa.GradientColorSelector}
                            disabled={disabled}
                            settings={colorSettings.settings}
                            onColorUpdate={onUpdateColor}
                            field={field}
                        />
                    }
                />
            );
        default:
            return null;
    }
};
