import React from 'react';

import {ArrowRight, TrashBin} from '@gravity-ui/icons';
import type {ActionsPanelProps} from '@gravity-ui/uikit';
import {ActionsPanel, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared/types/feature';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

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
    const actions: ActionsPanelProps['actions'] = [];

    if (countForMove) {
        actions.push({
            id: 'move',
            button: {
                props: {
                    children: [
                        <Icon key="icon" data={ArrowRight} size="16" />,
                        countForMove
                            ? `${i18n('action_move')} — ${countForMove}`
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
        });
    }

    const isMassRemoveEnabled = isEnabledFeature(Feature.MassRemoveCollectionsWorkbooks);

    if (countForDelete && isMassRemoveEnabled) {
        actions.push({
            id: 'delete',
            button: {
                props: {
                    children: [
                        <Icon key="icon" data={TrashBin} size="16" />,
                        `${i18n('action_delete')} — ${countForDelete}`,
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
        });
    }

    if (!actions.length) return null;

    return <ActionsPanel actions={actions} className={className} onClose={onClose} />;
};
