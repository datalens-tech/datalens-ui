import React, {useRef} from 'react';

import {Popup, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ColorPalette} from 'shared';
import {MinifiedPalette} from 'ui/units/wizard/components/MinifiedPalette/MinifiedPalette';
import {isValidHexColor} from 'ui/utils';

import {PaletteItem} from '../../../../../../Palette/components/PaletteItem/PaletteItem';

import './PaletteColorControl.scss';

type PaletteColorControlProps = {
    palette: string;
    controlQa?: string;
    currentColor: string;
    onPaletteItemChange: (color: string) => void;
    onPaletteUpdate: (paletteName: string) => void;
    onError?: (error: boolean) => void;
    disabled?: boolean;
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

    const ref = useRef<HTMLDivElement | null>(null);

    const handleInputColorUpdate = React.useCallback(
        (color: string) => {
            const hexColor = `#${color}`;
            onPaletteItemChange(hexColor);

            if (!isValidHexColor(hexColor)) {
                setErrorText(i18n('wizard', 'label_bars-custom-color-error'));
                onError?.(true);
                return;
            }

            onError?.(false);
            setErrorText('');
        },
        [onError, onPaletteItemChange],
    );

    const onPaletteItemClick = (color: string) => {
        onPaletteItemChange(color);
        setIsPaletteVisible(false);
    };

    const handleEnterPress = React.useCallback(() => {
        if (!currentColor || errorText) {
            return;
        }

        setIsPaletteVisible(false);
    }, [currentColor, errorText]);

    const paletteItemRef = React.useRef<HTMLDivElement | null>(null);

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
                    ref={paletteItemRef}
                />
                <Popup
                    onOpenChange={(_open, _event, reason) => {
                        if (reason === 'outside-press') {
                            setIsPaletteVisible(false);
                        }
                    }}
                    anchorElement={paletteItemRef.current}
                    open={isPaletteVisible}
                    placement={['right-end']}
                    className={b('palette')}
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
                    />
                </Popup>
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
        </div>
    );
};
