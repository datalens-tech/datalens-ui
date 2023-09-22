import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';

import type {ActionDelete} from './types';

import iconCross from '../../../../../../assets/icons/cross.svg';

const ICON_SIZE = 20;

type ActionDeleteViewProps<T = unknown> = Omit<ActionDelete<T>, 'type'>;

export const ActionDeleteView = <T extends unknown>(props: ActionDeleteViewProps<T>) => {
    const {item, onClick} = props;

    const handleClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
        (e) => {
            e.stopPropagation();
            onClick?.(item);
        },
        [item, onClick],
    );

    return (
        <Button size="s" view="flat-secondary" onClick={handleClick}>
            <Icon data={iconCross} size={ICON_SIZE} />
        </Button>
    );
};
