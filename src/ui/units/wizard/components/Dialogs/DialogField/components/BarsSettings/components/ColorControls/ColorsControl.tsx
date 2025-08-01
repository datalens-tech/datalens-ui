import React from 'react';

import {i18n} from 'i18n';
import type {ColorPalette, Field, TableBarsSettings} from 'shared';
import {BarsColorType, DialogFieldBarsSettingsQa} from 'shared';
import {getColorByColorSettings} from 'shared/utils/palettes';
import {getPaletteColors} from 'ui/utils';

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

    const paletteColors = React.useMemo(() => {
        return getPaletteColors(colorSettings.settings.palette, colorPalettes);
    }, [colorPalettes, colorSettings.settings.palette]);

    switch (colorSettings.colorType) {
        case BarsColorType.OneColor: {
            const currentColor = getColorByColorSettings({
                currentColors: paletteColors,
                colorIndex: colorSettings.settings.colorIndex,
                color: colorSettings.settings.color,
            });
            return (
                <DialogFieldRow
                    customMarginBottom="25px"
                    title={i18n('wizard', 'label_bars-color')}
                    setting={
                        <PaletteColorControl
                            palette={colorSettings.settings.palette}
                            controlQa={DialogFieldBarsSettingsQa.ColorSelector}
                            currentColor={currentColor}
                            onPaletteItemChange={(color, index?: number) =>
                                onUpdateColor(
                                    index
                                        ? {colorIndex: index, color: undefined}
                                        : {color, colorIndex: undefined},
                                )
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
            const positiveColor = getColorByColorSettings({
                currentColors: paletteColors,
                colorIndex: colorSettings.settings.positiveColorIndex,
                color: colorSettings.settings.positiveColor,
                fallbackIndex: 2,
            });
            const negativeColor = getColorByColorSettings({
                currentColors: paletteColors,
                colorIndex: colorSettings.settings.negativeColorIndex,
                color: colorSettings.settings.negativeColor,
                fallbackIndex: 1,
            });

            return (
                <React.Fragment>
                    <DialogFieldRow
                        title={i18n('wizard', 'label_bars-positive-color')}
                        setting={
                            <PaletteColorControl
                                palette={colorSettings.settings.palette}
                                controlQa={DialogFieldBarsSettingsQa.PositiveColorSelector}
                                currentColor={positiveColor}
                                onPaletteItemChange={(color, index?: number) =>
                                    onUpdateColor(
                                        index
                                            ? {positiveColorIndex: index, positiveColor: undefined}
                                            : {positiveColor: color, positiveColorIndex: undefined},
                                    )
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
                                currentColor={negativeColor}
                                onPaletteItemChange={(color: string, index?: number) => {
                                    onUpdateColor(
                                        index
                                            ? {negativeColorIndex: index, negativeColor: undefined}
                                            : {negativeColor: color, negativeColorIndex: undefined},
                                    );
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
