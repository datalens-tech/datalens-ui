import React from 'react';

import {TextInput, TextInputProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DatepickerControlSize} from '../../types';

const b = block('yc-simple-datepicker');

interface InputProps {
    onChange: TextInputProps['onChange'];
    onFocus?: () => void;
    onKeyDown?: TextInputProps['onKeyDown'];
    onBlur?: TextInputProps['onBlur'];
    name: string;
    type: 'date' | 'time';
    size?: DatepickerControlSize;
    placeholder?: string;
    value?: string;
    min?: string;
    max?: string;
    active?: boolean;
    native?: boolean;
    relative?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        name,
        type,
        placeholder,
        value,
        min,
        max,
        active,
        native,
        relative,
        disabled,
        invalid,
        size,
        onChange,
        onFocus,
        onKeyDown,
        onBlur,
    } = props;

    const onInputFocus = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            if (!native) {
                e.target.selectionStart = e.target.value.length;
            }

            if (!active) {
                onFocus?.();
            }
        },
        [active, native, onFocus],
    );

    const mods = {[type]: true, relative, invalid, disabled};
    const nativeMods = {[type]: true, disabled};

    if (native) {
        return (
            <input
                ref={ref}
                className={b('control-input-native', nativeMods)}
                autoComplete="off"
                type={type}
                name={name}
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={onChange}
                onFocus={onInputFocus}
                onBlur={onBlur}
            />
        );
    }

    return (
        <div className={b('control-input', mods)}>
            <React.Fragment>
                <TextInput
                    controlRef={ref}
                    view="clear"
                    autoComplete="off"
                    size={size}
                    name={name}
                    placeholder={relative ? '' : placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                    onFocus={onInputFocus}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                />
                {props.children}
            </React.Fragment>
        </div>
    );
});

Input.displayName = 'Input';
