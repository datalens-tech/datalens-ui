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
    const {onUpdateColor, colorSettings, onUpdatePalette, disabled, onError, field, colorPalettes} =
        props;

    switch (colorSettings.colorType) {
        case BarsColorType.OneColor:
            return (
                <DialogFieldRow
                    customMarginBottom="25px"
                    title={i18n('wizard', 'label_bars-color')}
                    setting={
                        <PaletteColorControl
                            palette={colorSettings.settings.palette}
                            controlQa={DialogFieldBarsSettingsQa.ColorSelector}
                            currentColor={colorSettings.settings.color}
                            onPaletteItemChange={(color) => onUpdateColor({color})}
                            onPaletteUpdate={onUpdatePalette}
                            onError={onError}
                            disabled={disabled}
                            colorPalettes={colorPalettes}
                        />
                    }
                />
            );
        case BarsColorType.TwoColor:
            return (
                <>
                    <DialogFieldRow
                        title={i18n('wizard', 'label_bars-positive-color')}
                        setting={
                            <PaletteColorControl
                                palette={colorSettings.settings.palette}
                                controlQa={DialogFieldBarsSettingsQa.PositiveColorSelector}
                                currentColor={colorSettings.settings.positiveColor}
                                onPaletteItemChange={(color) =>
                                    onUpdateColor({positiveColor: color})
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
                                palette={colorSettings.settings.palette}
                                controlQa={DialogFieldBarsSettingsQa.NegativeColorSelector}
                                currentColor={colorSettings.settings.negativeColor}
                                onPaletteItemChange={(color: string) => {
                                    onUpdateColor({negativeColor: color});
                                }}
                                onPaletteUpdate={onUpdatePalette}
                                onError={onError}
                                disabled={disabled}
                                colorPalettes={colorPalettes}
                            />
                        }
                    />
                </>
            );
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
