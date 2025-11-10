import React, {useCallback, useRef} from 'react';

import block from 'bem-cn-lite';
import type {ColorPalette} from 'shared';
import {DialogFieldBarsSettingsQa} from 'shared';
import {ColorPaletteSelect} from 'ui/components/ColorPaletteSelect/ColorPaletteSelect';
import {
    ColorPickerInput,
    type ColorPickerInputProps,
} from 'ui/components/ColorPickerInput/ColorPickerInput';
import {useEnterClick} from 'ui/hooks/useEnterClick';
import {PaletteTypes} from 'ui/units/wizard/constants';
import {getPaletteColors} from 'ui/utils';

import {Palette} from '../Palette/Palette';

import './MinifiedPalette.scss';

type MinifiedPaletteProps = {
    onPaletteUpdate: (paletteName: string) => void;
    onPaletteItemClick: (color: string) => void;
    onInputColorUpdate: (colorHex: string) => void;
    onEnterPress?: () => void;
    palette: string;
    currentColorHex: string;
    colorPalettes: ColorPalette[];
    controlQa?: string;
    customColorSelected?: boolean;
    customColorBtnQa?: string;
} & Pick<ColorPickerInputProps, 'onValidChange'>;

const b = block('minified-palette');

export const MinifiedPalette: React.FC<MinifiedPaletteProps> = (props: MinifiedPaletteProps) => {
    const {
        onPaletteUpdate,
        palette,
        onPaletteItemClick,
        currentColorHex,
        controlQa,
        onInputColorUpdate,
        onEnterPress,
        colorPalettes,
        customColorSelected,
        customColorBtnQa,
        onValidChange,
    } = props;

    const paletteRef = useRef<HTMLDivElement | null>(null);
    const handleEnterPress = useCallback(() => {
        if (onEnterPress) {
            onEnterPress();
        }
    }, [onEnterPress]);

    const handlePaletteItemClick = useCallback(
        (color: string) => {
            onPaletteItemClick(color);
            onValidChange?.(true);
        },
        [onPaletteItemClick, onValidChange],
    );

    const handleColorPickerInputUpdate = useCallback(
        (colorHex: string | null) => {
            if (colorHex === null) {
                return;
            }

            onInputColorUpdate(colorHex);
        },
        [onInputColorUpdate],
    );

    useEnterClick(paletteRef, handleEnterPress);

    const colors = React.useMemo(
        () => getPaletteColors(palette, colorPalettes),
        [colorPalettes, palette],
    );

    return (
        <div className={b()} ref={paletteRef}>
            <ColorPaletteSelect
                className={b('selector')}
                qa={DialogFieldBarsSettingsQa.MinifiedPaletteSelector}
                colorPalettes={colorPalettes}
                onUpdate={([paletteId]) => onPaletteUpdate(paletteId ?? undefined)}
                value={palette}
                withAuto={true}
            />
            <Palette
                paletteType={PaletteTypes.Colors}
                palette={colors}
                onPaletteItemClick={handlePaletteItemClick}
                isSelectedItem={(color) => !customColorSelected && color === currentColorHex}
                className={b('palette')}
                itemClassName={b('item')}
                customColor={{
                    enabled: true,
                    selected: Boolean(customColorSelected),
                    onSelect: () => onInputColorUpdate(currentColorHex),
                    qa: customColorBtnQa,
                }}
            />
            {customColorSelected && (
                <div className={b('color-input-wrapper')}>
                    <ColorPickerInput
                        required
                        value={currentColorHex}
                        qa={controlQa ? `${controlQa}-palette-input` : undefined}
                        size="m"
                        onUpdate={handleColorPickerInputUpdate}
                        onValidChange={onValidChange}
                    />
                </div>
            )}
        </div>
    );
};
