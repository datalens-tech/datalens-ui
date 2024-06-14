import React from 'react';

import type {ActionsPanelProps} from '@gravity-ui/components';
import {ActionsPanel} from '@gravity-ui/components';
import {FolderArrowDown, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {BatchAction} from '../../types';

const i18n = I18n.keyset('component.navigation.view');

export type BatchPanelProps = {
    count: number;
    onAction: (action: BatchAction) => void;
    onClose: () => void;
    className?: string;
};

export const BatchPanel = ({count, className, onAction, onClose}: BatchPanelProps) => {
    const actions: ActionsPanelProps['actions'] = React.useMemo(
        () => [
            {
                id: 'move',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={FolderArrowDown} size="16" />,
                            i18n('button_move'),
                        ],
                        onClick: () => onAction(BatchAction.Move),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchAction.Move),
                        text: i18n('button_move'),
                    },
                },
            },
            {
                id: 'delete',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={TrashBin} size="16" />,
                            i18n('button_delete'),
                        ],
                        onClick: () => onAction(BatchAction.Delete),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchAction.Delete),
                        text: i18n('button_delete'),
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
            renderNote={() => i18n('label_batch-selected-entries-count', {value: count})}
        />
    );
};
