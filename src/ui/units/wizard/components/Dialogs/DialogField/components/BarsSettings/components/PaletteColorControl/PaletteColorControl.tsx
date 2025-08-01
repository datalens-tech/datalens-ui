import React, {useRef} from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ColorPalette} from 'shared';
import {useOutsideClick} from 'ui/hooks/useOutsideClick';
import {MinifiedPalette} from 'ui/units/wizard/components/MinifiedPalette/MinifiedPalette';
import {getPaletteColors, isValidHexColor} from 'ui/utils';

import {PaletteItem} from '../../../../../../Palette/components/PaletteItem/PaletteItem';

import './PaletteColorControl.scss';

type PaletteColorControlProps = {
    palette: string;
    controlQa: string;
    currentColor: string;
    onPaletteItemChange: (color: string, index?: number) => void;
    onPaletteUpdate: (paletteName: string) => void;
    onError: (error: boolean) => void;
    disabled: boolean;
    colorPalettes: ColorPalette[];
};

const b = block('palette-color-control');

export const PaletteColorControl: React.FC<PaletteColorControlProps> = (
    props: PaletteColorControlProps,
) => {
    const {
        controlQa,
        currentColor,
        onPaletteItemChange,
        onPaletteUpdate,
        palette,
        onError,
        disabled,
        colorPalettes,
    } = props;

    const [isPaletteVisible, setIsPaletteVisible] = React.useState<boolean>(false);
    const [errorText, setErrorText] = React.useState<string>('');

    const paletteColors = React.useMemo(() => {
        return getPaletteColors(palette, colorPalettes);
    }, [colorPalettes, palette]);

    const ref = useRef<HTMLDivElement | null>(null);

    const handleOutsideClick = React.useCallback(() => {
        setIsPaletteVisible(false);
    }, []);

    const handleInputColorUpdate = React.useCallback(
        (color: string) => {
            const hexColor = `#${color}`;

            const colorPaletteIndex = paletteColors.indexOf(hexColor);
            const colorIndex = colorPaletteIndex === -1 ? undefined : colorPaletteIndex;

            onPaletteItemChange(hexColor, colorIndex);

            if (!isValidHexColor(hexColor)) {
                setErrorText(i18n('wizard', 'label_bars-custom-color-error'));
                onError(true);
                return;
            }

            onError(false);
            setErrorText('');
        },
        [onError, onPaletteItemChange, paletteColors],
    );

    const onPaletteItemClick = (color: string) => {
        onPaletteItemChange(color, paletteColors.indexOf(color) || undefined);
        setIsPaletteVisible(false);
    };

    const handleEnterPress = React.useCallback(() => {
        if (!currentColor || errorText) {
            return;
        }

        setIsPaletteVisible(false);
    }, [currentColor, errorText]);

    // Solves the problem of clicking on the palette in the selector. Since the palette list is rendered in the body, not in the ref container
    const additionalCheck = React.useCallback(() => {
        return Boolean(document.getElementsByClassName('g-select-list__item').length);
    }, []);

    useOutsideClick(ref, handleOutsideClick, additionalCheck);

    return (
        <div className={b()} ref={ref}>
            <div className={b('color-control-wrapper')}>
                <PaletteItem
                    className={b('color-control-button')}
                    color={currentColor}
                    isDisabled={disabled}
                    onClick={() => {
                        if (!disabled) {
                            setIsPaletteVisible((prev) => !prev);
                        }
                    }}
                    qa={controlQa}
                />
                <TextInput
                    // Cut # from color in HEX format
                    disabled={disabled}
                    error={errorText}
                    value={currentColor.slice(1)}
                    qa={`${controlQa}-input`}
                    onUpdate={handleInputColorUpdate}
                    className={b('color-control-input')}
                />
            </div>
            {isPaletteVisible && (
                <div className={b('palette')}>
                    <MinifiedPalette
                        onPaletteUpdate={onPaletteUpdate}
                        onPaletteItemClick={onPaletteItemClick}
                        palette={palette}
                        currentColor={currentColor}
                        errorText={errorText}
                        controlQa={controlQa}
                        onInputColorUpdate={handleInputColorUpdate}
                        onEnterPress={handleEnterPress}
                        colorPalettes={colorPalettes}
                    />
                </div>
            )}
        </div>
    );
};
