import React from 'react';

import type {ActionsPanelProps} from '@gravity-ui/components';
import {ActionsPanel} from '@gravity-ui/components';
import {ArrowRight, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {BatchAction} from '../../types';

const i18n = I18n.keyset('component.navigation.view');

export type BatchPanelProps = {
    count: number;
    countForMove?: number;
    countForDelete?: number;
    onAction: (action: BatchAction) => void;
    onClose: () => void;
    className?: string;
};

export const BatchPanel = ({
    count,
    countForMove,
    countForDelete,
    className,
    onAction,
    onClose,
}: BatchPanelProps) => {
    const actions: ActionsPanelProps['actions'] = React.useMemo(
        () => [
            {
                id: 'move',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={ArrowRight} size="16" />,
                            countForMove
                                ? `${i18n('button_move')} - ${countForMove}`
                                : i18n('button_move'),
                        ],
                        onClick: () => onAction('move'),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction('move'),
                        text: i18n('button_move'),
                    },
                },
            },
        ],
        [countForMove, onAction],
    );

    if (countForDelete) {
        actions.push({
            id: 'delete',
            button: {
                props: {
                    children: [
                        <Icon key="icon" data={TrashBin} size="16" />,
                        `${i18n('button_delete')} - ${countForDelete}`,
                    ],
                    onClick: () => onAction('delete'),
                },
            },
            dropdown: {
                item: {
                    action: () => onAction('delete'),
                    text: i18n('button_delete'),
                },
            },
        });
    }

    return (
        <ActionsPanel
            actions={actions}
            className={className}
            onClose={onClose}
            renderNote={() => i18n('label_batch-selected-entries-count', {value: count})}
        />
    );
};
