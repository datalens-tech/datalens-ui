import React from 'react';

import {RadioButton, RadioButtonOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './DialogRadioButtons.scss';

type Props = {
    disabled?: boolean;
    items: RadioButtonOption[];
    value: string | undefined;
    onUpdate: (value: string) => void;
    stretched?: boolean;
    qa?: string;
};

const b = block('dialog-radio-buttons');

const DialogRadioButtons = React.forwardRef<HTMLDivElement, Props>(
    (props: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
        return (
            <RadioButton
                className={b({stretched: props.stretched})}
                size="m"
                value={props.value}
                onUpdate={props.onUpdate}
                disabled={props.disabled}
                qa={props.qa}
                ref={ref}
            >
                {props.items.map(({value, content, disabled}, index) => {
                    return (
                        <RadioButton.Option
                            key={`${value}-${index}`}
                            value={value}
                            disabled={disabled}
                        >
                            {content}
                        </RadioButton.Option>
                    );
                })}
            </RadioButton>
        );
    },
);

DialogRadioButtons.displayName = 'DialogRadioButtons';

export {DialogRadioButtons};
