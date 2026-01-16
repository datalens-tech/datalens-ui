import React from 'react';

import {Moon, Sun} from '@gravity-ui/icons';
import type {FlexProps, RealTheme} from '@gravity-ui/uikit';
import {Flex, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ColorPickerInputProps} from 'ui/components/ColorPickerInput/ColorPickerInput';
import ColorPickerInputWithPreset from 'ui/units/dash/containers/Dialogs/components/ColorPickerInputWithPreset/ColorPickerInputWithPreset';

import type {ColorSettings} from '../../../../../../../shared/types';
import {isColorByTheme} from '../../../../../../../shared/utils';

import './ColorInputsGroup.scss';
const b = block('color-inputs-group');

export interface ColorInputsGroupProps extends Pick<ColorPickerInputProps, 'placeholder'> {
    theme?: RealTheme;
    value: ColorSettings | undefined;
    onUpdate: (value: ColorSettings | undefined) => void;
    onBlur?: () => void;
    isSingleColorSelector?: boolean;
    direction?: FlexProps['direction'];
    className?: string;
    mainPresetOptions?: string[];
    paletteOptions?: string[];
    width?: 'max';
}

export function ColorInputsGroup({
    theme,
    value,
    onUpdate,
    onBlur,
    className,
    isSingleColorSelector = false,
    direction = 'row',
    mainPresetOptions,
    paletteOptions,
    placeholder,
    width,
}: ColorInputsGroupProps) {
    const {light, dark, common} = isColorByTheme(value)
        ? {...value, common: undefined}
        : {common: value};

    return (
        <Flex className={b({width}, className)} direction={direction}>
            {isSingleColorSelector ? (
                <ColorPickerInputWithPreset
                    placeholder={placeholder}
                    mainPresetOptions={mainPresetOptions}
                    paletteOptions={paletteOptions}
                    className={b('color-input')}
                    theme={theme}
                    value={common}
                    onUpdate={(color) => onUpdate(color ?? undefined)}
                    onBlur={onBlur}
                    hasOpacityInput
                />
            ) : (
                <React.Fragment>
                    <div className={b('item')}>
                        <Icon data={Sun} size={16} className={b('theme-icon')} />
                        <ColorPickerInputWithPreset
                            mainPresetOptions={mainPresetOptions}
                            paletteOptions={paletteOptions}
                            className={b('color-input')}
                            value={light}
                            theme="light"
                            onUpdate={(color) => onUpdate({light: color ?? undefined, dark})}
                            onBlur={onBlur}
                            hasOpacityInput
                        />
                    </div>
                    <div className={b('item')}>
                        <Icon data={Moon} size={16} className={b('theme-icon')} />
                        <ColorPickerInputWithPreset
                            mainPresetOptions={mainPresetOptions}
                            paletteOptions={paletteOptions}
                            className={b('color-input')}
                            value={dark}
                            theme="dark"
                            onUpdate={(color) => onUpdate({dark: color ?? undefined, light})}
                            onBlur={onBlur}
                            hasOpacityInput
                        />
                    </div>
                </React.Fragment>
            )}
        </Flex>
    );
}
