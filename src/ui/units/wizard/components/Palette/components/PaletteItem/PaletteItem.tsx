import type {PropsWithChildren} from 'react';
import React, {forwardRef} from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import lockIcon from '@gravity-ui/icons/svgs/lock.svg';

import './PaletteItem.scss';

type PaletteItemProps = {
    className?: string;
    color?: string;
    onClick?: () => void;
    qa?: string;
    isDefault?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isSelectable?: boolean;
};

const b = block('palette-item');

export const PaletteItem = forwardRef<HTMLDivElement | null, PropsWithChildren<PaletteItemProps>>(
    (
        {
            children,
            qa,
            className,
            onClick,
            color,
            isSelected,
            isDefault,
            isDisabled,
            isSelectable = true,
        },
        ref,
    ) => {
        const mods = {
            default: Boolean(isDefault),
            selected: Boolean(isSelected),
            disabled: Boolean(isDisabled),
            selectable: isSelectable,
        };
        const style = color ? {backgroundColor: color} : undefined;
        return (
            <div
                className={b(mods, className)}
                data-qa={qa}
                style={style}
                onClick={onClick}
                ref={ref}
            >
                {isDisabled && <Icon data={lockIcon} className={b('lock-icon')} />}
                {children}
            </div>
        );
    },
);
