import React from 'react';

import type {ActionsPanelProps} from '@gravity-ui/components';
import {ActionsPanel} from '@gravity-ui/components';
import {Eye, EyeSlash, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {BatchFieldAction} from '../../constants';

export const BatchActionPanel = ({
    count,
    className,
    onAction,
    onClose,
}: {
    count: number;
    className?: string;
    onAction: (action: BatchFieldAction) => void;
    onClose?: () => void;
}) => {
    const actions: ActionsPanelProps['actions'] = React.useMemo(
        () => [
            {
                id: 'delete',
                button: {
                    props: {
                        children: [<Icon key="icon" data={TrashBin} size="16" />, 'Delete'],
                        onClick: () => onAction(BatchFieldAction.Remove),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Remove),
                        text: 'Delete',
                    },
                },
            },
            {
                id: 'hide',
                button: {
                    props: {
                        children: [<Icon key="icon" data={EyeSlash} size="16" />, 'Hide'],
                        onClick: () => onAction(BatchFieldAction.Hide),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Hide),
                        text: 'Hide',
                    },
                },
            },
            {
                id: 'show',
                button: {
                    props: {
                        children: [<Icon key="icon" data={Eye} size="16" />, 'Show'],
                        onClick: () => onAction(BatchFieldAction.Show),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Show),
                        text: 'Hide',
                    },
                },
            },
        ],
        [onAction],
    );

    return (
        <ActionsPanel
            actions={actions}
            className={className}
            onClose={onClose}
            renderNote={() => `selected ${count}`}
        />
    );
};
