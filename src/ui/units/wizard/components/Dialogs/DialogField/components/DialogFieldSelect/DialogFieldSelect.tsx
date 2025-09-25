import React from 'react';

import {TriangleExclamation} from '@gravity-ui/icons';
import type {SelectOption, SelectOptionGroup} from '@gravity-ui/uikit';
import {Icon, Popover, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';

import './DialogFieldSelect.scss';

type Props = {
    placeholder?: string;
    options: SelectOption[] | SelectOptionGroup[];
    value: string | undefined;
    onUpdate: (value: string) => void;
    controlTestAnchor?: string;
    showItemIcon?: boolean;
    disabled?: boolean;
    warning?: string;
};

const b = block('dialog-field-select');

export const DialogFieldSelect: React.FC<Props> = (props: Props) => {
    const {
        onUpdate,
        showItemIcon,
        options,
        placeholder,
        value,
        controlTestAnchor,
        disabled,
        warning,
    } = props;

    const renderOption = React.useCallback(
        (option: SelectOption) => {
            return <SelectOptionWithIcon option={option} disabledIcon={disabled} />;
        },
        [disabled],
    );

    return (
        <React.Fragment>
            <Select
                qa={controlTestAnchor}
                onUpdate={([newValue]) => onUpdate(newValue)}
                className={b({disabled})}
                popupClassName={b('popup')}
                placeholder={placeholder}
                value={typeof value === 'undefined' ? value : [value]}
                renderOption={showItemIcon ? renderOption : undefined}
                renderSelectedOption={showItemIcon ? renderOption : undefined}
                disabled={disabled}
                options={options}
            />
            {warning && (
                <Popover content={<div className={b('warning-popover-text')}>{warning}</div>}>
                    <Icon className={b('warning-icon')} data={TriangleExclamation} />
                </Popover>
            )}
        </React.Fragment>
    );
};
