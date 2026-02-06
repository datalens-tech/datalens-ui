import React from 'react';

import {Minus, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ValueOf} from 'shared';

import './NumberInput.scss';

const b = block('number-input');

export const STEP_BUTTON_DIRECTION = {
    Plus: '+',
    Minus: '-',
} as const;

export type StepButtonDirection = ValueOf<typeof STEP_BUTTON_DIRECTION>;

interface StepButtonProps {
    direction: StepButtonDirection;
    disabled: boolean;
    onClick: () => void;
}

const DIRECTION_CONFIG: Record<
    StepButtonDirection,
    {icon: typeof Plus | typeof Minus; pin: 'brick-round' | 'round-brick'}
> = {
    [STEP_BUTTON_DIRECTION.Plus]: {icon: Plus, pin: 'brick-round'},
    [STEP_BUTTON_DIRECTION.Minus]: {icon: Minus, pin: 'round-brick'},
};

export const StepButton: React.FC<StepButtonProps> = ({direction, disabled, onClick}) => {
    const {icon, pin} = DIRECTION_CONFIG[direction];

    return (
        <div className={b('input-button')}>
            <Button view="outlined" pin={pin} width="max" disabled={disabled} onClick={onClick}>
                <Icon data={icon} />
            </Button>
        </div>
    );
};
