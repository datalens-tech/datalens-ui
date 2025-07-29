import React, {useCallback, useRef} from 'react';

import type {PaletteOption} from '@gravity-ui/uikit';
import {Palette, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ColorPalette} from 'shared';
import {DialogFieldBarsSettingsQa} from 'shared';
import {DecoratedColorItem} from 'ui/components/DecoratedColorItem/DecoratedColorItem';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';
import {useEnterClick} from 'ui/hooks/useEnterClick';
import {getPaletteSelectorItems} from 'ui/units/wizard/utils/palette';
import {getPaletteColors} from 'ui/utils';

import {PaletteItem} from '../Palette/components/PaletteItem/PaletteItem';

import './MinifiedPalette.scss';

type MinifiedPaletteProps = {
    onPaletteUpdate: (paletteName: string) => void;
    onPaletteItemClick: (value: string[]) => void;
    onInputColorUpdate: (color: string) => void;
    onEnterPress?: () => void;
    palette: string;
    currentColor: string;
    colorPalettes: ColorPalette[];
    errorText?: string;
    controlQa?: string;
    size?: 's' | 'm';
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
    } = props;

    const paletteRef = useRef<HTMLDivElement | null>(null);
    const handleEnterPress = useCallback(() => {
        if (onEnterPress) {
            onEnterPress();
        }
    }, [onEnterPress]);

    useEnterClick(paletteRef, handleEnterPress);

    const selectOptions = getPaletteSelectorItems({colorPalettes});

    const colors = React.useMemo(
        () => [...getPaletteColors(palette, colorPalettes), 'input'],
        [colorPalettes, palette],
    );

    const options: PaletteOption[] = colors.map((colorItem) => {
        const selected = colorItem === currentColor;
        return {
            content: <DecoratedColorItem selected={selected} color={colorItem} />,
            value: colorItem,
        };
    });

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
                options={selectOptions}
            />
            <Palette
                columns={7}
                options={options}
                onUpdate={onPaletteItemClick}
                className={b('palette', {size})}
                optionClassName={b('item', {size})}
                multiple={false}
            />
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
        </div>
    );
};
