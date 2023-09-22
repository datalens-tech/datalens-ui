import React, {ChangeEvent} from 'react';

import {Button, ButtonProps, useFileInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ButtonAttach.scss';

export type ButtonAttachProps = Omit<ButtonProps, 'onClick'> & {
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
                <Button {...buttonProps} ref={ref} />
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
