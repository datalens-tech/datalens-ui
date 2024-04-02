import React, {useCallback, useRef} from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ColorPalette, DialogFieldBarsSettingsQa} from 'shared';
import {useEnterClick} from 'ui/hooks/useEnterClick';
import {getPaletteColors} from 'ui/utils';

import Palette from '../../../../components/Palette/Palette';
import {PaletteItem} from '../../../../components/Palette/components/PaletteItem/PaletteItem';
import {PaletteTypes} from '../../../../components/Palette/constants';
import {PaletteSelect} from '../../../../components/PaletteSelect/PaletteSelect';

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

    const colors = React.useMemo(
        () => getPaletteColors(palette, colorPalettes),
        [colorPalettes, palette],
    );

    return (
        <div className={b()} ref={paletteRef}>
            <PaletteSelect
                qa={DialogFieldBarsSettingsQa.MinifiedPaletteSelector}
                onChange={onPaletteUpdate}
                value={palette}
                palettes={colorPalettes}
            />
            <Palette
                paletteType={PaletteTypes.Colors}
                palette={colors}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={(color) => color === currentColor}
                className={b('palette', {size})}
                itemClassName={b('item', {size})}
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
