import React, {useRef} from 'react';

import {Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ColorPalette} from 'shared';
import {MinifiedPalette} from 'ui/units/wizard/components/MinifiedPalette/MinifiedPalette';
import {getPaletteColors, isValidHexColor} from 'ui/utils';

import {PaletteItem} from '../../../../../../Palette/components/PaletteItem/PaletteItem';

import './PaletteColorControl.scss';

type PaletteColorControlProps = {
    palette: string;
    controlQa: string;
    currentColor: string;
    currentColorIndex?: number;
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
        currentColorIndex,
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

    const handleInputColorUpdate = React.useCallback(
        (color: string) => {
            const hexColor = `#${color}`;
            onPaletteItemChange(hexColor, undefined);

            if (!isValidHexColor(hexColor)) {
                setErrorText(i18n('wizard', 'label_bars-custom-color-error'));
                onError(true);
                return;
            }

            onError(false);
            setErrorText('');
        },
        [onError, onPaletteItemChange],
    );

    const onPaletteItemClick = (color: string) => {
        const index = paletteColors.indexOf(color);
        onPaletteItemChange(color, index === -1 ? undefined : index);
    };

    const handleEnterPress = React.useCallback(() => {
        if (!currentColor || errorText) {
            return;
        }

        setIsPaletteVisible(false);
    }, [currentColor, errorText]);

    return (
        <>
            <div className={b()}>
                <PaletteItem
                    ref={ref}
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
            </div>

            <Popup
                open={isPaletteVisible}
                anchorElement={ref.current}
                hasArrow
                className={b('palette')}
                onOpenChange={setIsPaletteVisible}
                placement="right"
            >
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
                    customColorSelected={typeof currentColorIndex !== 'number'}
                />
            </Popup>
        </>
    );
};
