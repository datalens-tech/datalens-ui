import React from 'react';

import type {IconData} from '@gravity-ui/uikit';
import {Button, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './PlaceholderActionIcon.scss';

interface PlaceholderActionIconProps {
    icon: IconData;
    iconSize?: number;
    onClick?: React.MouseEventHandler | VoidFunction;
    className?: string;
    disabledText?: string | React.ReactNode;
    hoverText?: string;
    qa?: string;
    hidden?: boolean;
    isFirstElementInRow?: boolean;
}

const b = block('placeholder-action-icon');

const PlaceholderActionIcon: React.FC<PlaceholderActionIconProps> = ({
    icon: iconData,
    iconSize,
    onClick,
    className,
    disabledText,
    hoverText,
    qa,
    hidden,
    isFirstElementInRow,
}) => {
    if (hidden) {
        return null;
    }

    const icon = <Icon data={iconData} size={iconSize ?? 16} />;

    const content = (
        <Button view="flat-secondary" size="s" onClick={onClick} qa={qa}>
            {icon}
        </Button>
    );

    return disabledText || hoverText ? (
        <Popover
            placement={['right', 'top', 'bottom']}
            content={disabledText || hoverText}
            className={b({first: isFirstElementInRow}, className)}
        >
            {content}
        </Popover>
    ) : (
        <div className={b({first: isFirstElementInRow}, className)}>{content}</div>
    );
};

export default PlaceholderActionIcon;
