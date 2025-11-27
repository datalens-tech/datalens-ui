import React from 'react';

import {Moon, Sun} from '@gravity-ui/icons';
import type {FlexProps, RealTheme} from '@gravity-ui/uikit';
import {Flex, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import ColorPickerInputWithPreset from 'ui/units/dash/containers/Dialogs/components/ColorPickerInputWithPreset/ColorPickerInputWithPreset';

import {type ColorByTheme} from '../../../../../../../shared';
import {ColorPickerInput} from '../../../../../../components/ColorPickerInput/ColorPickerInput';

import './ColorInputsGroup.scss';
const b = block('color-inputs-group');

export interface ColorInputsGroupProps {
    theme?: RealTheme;
    value: ColorByTheme | undefined;
    onUpdate: (value: ColorByTheme) => void;
    isSingleColorSelector?: boolean;
    direction?: FlexProps['direction'];
    className?: string;
    mainPresetOptions?: string[];
    paletteOptions?: string[];
}

export function ColorInputsGroup({
    theme,
    value,
    onUpdate,
    className,
    isSingleColorSelector = false,
    direction = 'row',
    mainPresetOptions,
    paletteOptions,
}: ColorInputsGroupProps) {
    return (
        <Flex className={b(null, className)} direction={direction}>
            {isSingleColorSelector ? (
                <ColorPickerInput
                    className={b('color-input')}
                    theme={theme}
                    value={value?.common}
                    onUpdate={(color) => onUpdate({common: color ?? undefined})}
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
                            value={value?.light}
                            theme="light"
                            onUpdate={(color) =>
                                onUpdate({light: color ?? undefined, dark: value?.dark})
                            }
                            hasOpacityInput
                        />
                    </div>
                    <div className={b('item')}>
                        <Icon data={Moon} size={16} className={b('theme-icon')} />
                        <ColorPickerInputWithPreset
                            mainPresetOptions={mainPresetOptions}
                            paletteOptions={paletteOptions}
                            className={b('color-input')}
                            value={value?.dark}
                            theme="dark"
                            onUpdate={(color) =>
                                onUpdate({dark: color ?? undefined, light: value?.light})
                            }
                            hasOpacityInput
                        />
                    </div>
                </React.Fragment>
            )}
        </Flex>
    );
}
