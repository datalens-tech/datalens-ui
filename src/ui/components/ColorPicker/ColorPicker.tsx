import React from 'react';

import {Text, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import chroma from 'chroma-js';
import {i18n} from 'i18n';
import {isValidHexColor} from 'ui/utils';

import './ColorPicker.scss';

const normalizeColor = (color?: string) => color?.toUpperCase() || '';
const sanitizeColor = (color: string) => {
    return normalizeColor(chroma(color).hex());
};

const b = block('color-picker');

export interface ColorPickerProps {
    selectedPresetColor?: string;
    className?: string;
    color?: string;
    onColorUpdate: (color: string) => void;
    error?: string;
    setError?: (error: string | undefined) => void;
}

export function ColorPicker({
    selectedPresetColor,
    className,
    color,
    onColorUpdate: externalColorUpdateHandler,
    error,
    setError,
}: ColorPickerProps) {
    const handleColorUpdate = React.useCallback(
        (value: string) => {
            const hexColor = `#${value}`.replace('##', '#');
            externalColorUpdateHandler(hexColor.length > 1 ? hexColor : '');

            if (!value || isValidHexColor(hexColor, true)) {
                setError?.(undefined);
            } else {
                setError?.(i18n('wizard', 'label_bars-custom-color-error'));
            }
        },
        [externalColorUpdateHandler, setError],
    );

    const [computedPresetColor, setComputedPresetColor] = React.useState<string | undefined>();
    const previewRef = React.useCallback<React.RefCallback<HTMLDivElement>>(
        (previewEl) => {
            if (previewEl) {
                if (selectedPresetColor) {
                    const bgColor = getComputedStyle(previewEl).backgroundColor;
                    setComputedPresetColor(bgColor ? sanitizeColor(bgColor) : undefined);
                } else {
                    setComputedPresetColor(undefined);
                }
            }
        },
        [selectedPresetColor],
    );

    const previewColor = color ? color : selectedPresetColor;
    const previewStyles: React.CSSProperties = {
        backgroundColor: error ? undefined : previewColor,
    };

    return (
        <div className={b(null, className)}>
            <TextInput
                validationState={error ? 'invalid' : undefined}
                startContent={
                    <React.Fragment>
                        <div
                            className={b('color-preview')}
                            style={previewStyles}
                            ref={previewRef}
                        />
                        <Text color="hint" className={b('color-hint')}>
                            #
                        </Text>
                    </React.Fragment>
                }
                placeholder={computedPresetColor ? computedPresetColor.slice(1) : ''}
                value={color?.replace('#', '') ?? ''}
                onUpdate={handleColorUpdate}
                className={b('color-input')}
            />
        </div>
    );
}
