import type {ChangeEvent} from 'react';
import React from 'react';

import type {ButtonButtonProps, ButtonProps} from '@gravity-ui/uikit';
import {Button, useFileInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ButtonAttach.scss';

export type ButtonAttachProps = Omit<ButtonProps<'input'>, 'onClick'> & {
    onUpdate?: (files: File[]) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    multiple?: boolean;
};

const cnButtonAttach = block('button-attach');

export const ButtonAttach = React.forwardRef<HTMLButtonElement, ButtonAttachProps>(
    ({onUpdate, onChange, accept, multiple = false, ...props}, ref) => {
        const {triggerProps, controlProps} = useFileInput({onUpdate, onChange});

        const buttonProps = {
            ...triggerProps,
            ...props,
        };

        return (
            <div className={cnButtonAttach()}>
                <Button {...(buttonProps as ButtonButtonProps)} ref={ref} />
                <input
                    {...controlProps}
                    accept={accept}
                    multiple={multiple}
                    autoComplete="off"
                    className={cnButtonAttach('input')}
                    disabled={props.disabled}
                />
            </div>
        );
    },
);

ButtonAttach.displayName = 'ButtonAttach';
