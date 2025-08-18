import React, {useCallback, useRef} from 'react';

import {Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ColorPalette} from 'shared';
import {DialogFieldBarsSettingsQa} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';
import {useEnterClick} from 'ui/hooks/useEnterClick';
import {PaletteTypes} from 'ui/units/wizard/constants';
import {getPaletteSelectorItems} from 'ui/units/wizard/utils/palette';
import {getPaletteColors} from 'ui/utils';

import {Palette} from '../Palette/Palette';
import {PaletteItem} from '../Palette/components/PaletteItem/PaletteItem';

import './MinifiedPalette.scss';

type MinifiedPaletteProps = {
    onPaletteUpdate: (paletteName: string) => void;
    onPaletteItemClick: (color: string) => void;
    onInputColorUpdate: (color: string) => void;
    onEnterPress?: () => void;
    palette: string;
    currentColor: string;
    colorPalettes: ColorPalette[];
    errorText?: string;
    controlQa?: string;
    size?: 's' | 'm';
    customColorSelected?: boolean;
};

const b = block('minified-palette');

export const MinifiedPalette: React.FC<MinifiedPaletteProps> = (props: MinifiedPaletteProps) => {
    const {
        onPaletteUpdate,
        palette,
        onPaletteItemClick,
        currentColor,
        errorText,
        controlQa,
        onInputColorUpdate,
        onEnterPress,
        colorPalettes,
        size = 's',
        customColorSelected,
    } = props;

    const paletteRef = useRef<HTMLDivElement | null>(null);
    const handleEnterPress = useCallback(() => {
        if (onEnterPress) {
            onEnterPress();
        }
    }, [onEnterPress]);

    useEnterClick(paletteRef, handleEnterPress);

    const options = getPaletteSelectorItems({colorPalettes});

    const colors = React.useMemo(
        () => getPaletteColors(palette, colorPalettes),
        [colorPalettes, palette],
    );

    return (
        <div className={b()} ref={paletteRef}>
            <Select
                qa={DialogFieldBarsSettingsQa.MinifiedPaletteSelector}
                className={b('selector')}
                popupClassName={b('selector-popup')}
                onUpdate={([paletteId]) => onPaletteUpdate(paletteId)}
                renderSelectedOption={(option) => {
                    return <SelectOptionWithIcon option={option} />;
                }}
                renderOption={(option) => {
                    return <SelectOptionWithIcon option={option} />;
                }}
                value={[palette]}
                options={options}
            />
            <Palette
                paletteType={PaletteTypes.Colors}
                palette={colors}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={(color) => color === currentColor}
                className={b('palette', {size})}
                itemClassName={b('item', {size})}
                customColorEnabled={true}
                customColorSelected={customColorSelected}
                onCustomColorSelected={() => onInputColorUpdate(currentColor.slice(1))}
            />
            {customColorSelected && (
                <div className={b('color-input-wrapper')}>
                    <PaletteItem color={currentColor} className={b('color-input-icon')} />
                    <TextInput
                        error={errorText}
                        // Cut # from color in HEX format
                        value={currentColor.slice(1)}
                        qa={controlQa ? `${controlQa}-palette-input` : undefined}
                        onUpdate={onInputColorUpdate}
                        className={b('color-input')}
                    />
                </div>
            )}
        </div>
    );
};
