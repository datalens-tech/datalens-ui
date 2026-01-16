import React, {useRef} from 'react';

import {Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ColorPalette} from 'shared';
import {getColorByColorSettings} from 'shared/utils/palettes';
import {MinifiedPalette} from 'ui/units/wizard/components/MinifiedPalette/MinifiedPalette';
import {getPaletteColors} from 'ui/utils';

import {PaletteItem} from '../../../../../../../../../components/PaletteItem/PaletteItem';

import './PaletteColorControl.scss';

type PaletteColorControlProps = {
    palette: string;
    controlQa: string;
    currentColorHex?: string;
    currentColorIndex?: number;
    defaultColorIndex?: number;
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
        currentColorHex,
        currentColorIndex,
        defaultColorIndex,
        onPaletteItemChange,
        onPaletteUpdate,
        palette,
        onError,
        disabled,
        colorPalettes,
    } = props;

    const [isPaletteVisible, setIsPaletteVisible] = React.useState<boolean>(false);

    const paletteColors = React.useMemo(() => {
        return getPaletteColors(palette, colorPalettes);
    }, [colorPalettes, palette]);

    const ref = useRef<HTMLDivElement | null>(null);

    const currentColorHexBySettings = getColorByColorSettings({
        currentColors: paletteColors,
        colorIndex: currentColorIndex,
        color: currentColorHex,
        fallbackIndex: defaultColorIndex,
    });

    const handleInputColorUpdate = React.useCallback(
        (colorHex: string) => {
            onPaletteItemChange(colorHex, undefined);
        },
        [onPaletteItemChange],
    );

    const onPaletteItemClick = (color: string) => {
        const index = paletteColors.indexOf(color);
        onPaletteItemChange(color, index === -1 ? undefined : index);
    };

    const handleEnterPress = React.useCallback(() => {
        if (!currentColorHexBySettings) {
            return;
        }

        setIsPaletteVisible(false);
    }, [currentColorHexBySettings]);

    const handlePalleteValidChange = React.useCallback(
        (valid: boolean): void => {
            onError(!valid);
        },
        [onError],
    );

    const handlePopupOpenChange = React.useCallback(
        (open: boolean) => {
            setIsPaletteVisible(open);

            if (!open) {
                onError(false);
            }
        },
        [onError],
    );

    return (
        <>
            <div className={b()}>
                <PaletteItem
                    ref={ref}
                    className={b('color-control-button')}
                    color={currentColorHexBySettings}
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
                onOpenChange={handlePopupOpenChange}
                placement="right"
            >
                <MinifiedPalette
                    onPaletteUpdate={onPaletteUpdate}
                    onPaletteItemClick={onPaletteItemClick}
                    palette={palette}
                    currentColorHex={currentColorHexBySettings}
                    controlQa={controlQa}
                    onInputColorUpdate={handleInputColorUpdate}
                    onEnterPress={handleEnterPress}
                    onValidChange={handlePalleteValidChange}
                    colorPalettes={colorPalettes}
                    customColorSelected={typeof currentColorIndex !== 'number'}
                />
            </Popup>
        </>
    );
};
