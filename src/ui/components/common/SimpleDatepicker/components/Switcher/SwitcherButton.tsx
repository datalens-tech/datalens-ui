import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {FlipDirection} from '../../utils';

const b = block('yc-simple-datepicker');
const ICON_SIZE = 16;

type SwitcherButtonProps = {
    onClick: () => void;
    direction: FlipDirection;
    disabled?: boolean;
};

export const SwitcherButton: React.FC<SwitcherButtonProps> = ({direction, disabled, onClick}) => {
    const mods = {
        back: direction === FlipDirection.Back,
        forward: direction === FlipDirection.Forward,
    };

    return (
        <Button
            className={b('switcher-button')}
            tabIndex={-1}
            view="flat"
            disabled={disabled}
            onClick={onClick}
        >
            <Icon className={b('switcher-button-icon', mods)} data={ChevronDown} size={ICON_SIZE} />
        </Button>
    );
};
