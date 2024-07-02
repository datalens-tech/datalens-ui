import React from 'react';

import type {ActionsPanelProps} from '@gravity-ui/components';
import {ActionsPanel} from '@gravity-ui/components';
import {ArrowRight, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

export type CollectionBatchAction = 'move' | 'delete';

const i18n = I18n.keyset('collections');

export type BatchPanelProps = {
    countForMove?: number;
    countForDelete?: number;
    onAction: (action: CollectionBatchAction) => void;
    onClose: () => void;
    className?: string;
};

export const CollectionBatchPanel = ({
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
                                ? `${i18n('action_move')} - ${countForMove}`
                                : i18n('action_move'),
                        ],
                        onClick: () => onAction('move'),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction('move'),
                        text: i18n('action_move'),
                    },
                },
            },
            {
                id: 'delete',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={TrashBin} size="16" />,
                            `${i18n('action_delete')} - ${countForDelete}`,
                        ],
                        onClick: () => onAction('delete'),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction('delete'),
                        text: i18n('action_delete'),
                    },
                },
            },
        ],
        [countForDelete, countForMove, onAction],
    );

    return <ActionsPanel actions={actions} className={className} onClose={onClose} />;
};
