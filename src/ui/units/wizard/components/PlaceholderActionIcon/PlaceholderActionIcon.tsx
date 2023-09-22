import React from 'react';

import {Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './PlaceholderActionIcon.scss';

interface PlaceholderActionIconProps {
    icon: React.ElementType;
    onClick?: () => void;
    className?: string;
    disabledText?: string;
    hoverText?: string;
    qa?: string;
    hidden?: boolean;
    isFirstElementInRow?: boolean;

    styles?: React.CSSProperties;
}

const b = block('placeholder-action-icon');

const PlaceholderActionIcon: React.FC<PlaceholderActionIconProps> = (props) => {
    if (props.hidden) {
        return null;
    }

    const Component = props.icon;

    const icon = <Component width="24" style={props.styles} />;

    return (
        <div
            className={b({first: props.isFirstElementInRow}, props.className)}
            onClick={props.onClick}
            data-qa={props.qa}
        >
            {props.disabledText || props.hoverText ? (
                <Popover
                    placement={['right', 'top', 'bottom']}
                    content={props.disabledText || props.hoverText}
                >
                    {icon}
                </Popover>
            ) : (
                icon
            )}
        </div>
    );
};

export default PlaceholderActionIcon;
