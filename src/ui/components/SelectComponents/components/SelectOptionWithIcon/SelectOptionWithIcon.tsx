import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './SelectOptionWithIcon.scss';

type BaseSelectOptionProps = {
    option: SelectOption<{icon: JSX.Element}>;
    disabledIcon?: boolean;
    className?: string;
};

const b = block('dl-select-option-with-icon');

export const SelectOptionWithIcon = (props: BaseSelectOptionProps) => {
    return (
        <div className={b({disabled: props.option.disabled}, props.className)}>
            {props.option.data?.icon && (
                <span className={b('icon', {disabled: props.disabledIcon})}>
                    {props.option.data?.icon}
                </span>
            )}
            <span className={b('content')}>{props.option.content}</span>
        </div>
    );
};
