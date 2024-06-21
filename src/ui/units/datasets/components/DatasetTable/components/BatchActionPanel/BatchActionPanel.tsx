import React from 'react';

import type {ActionsPanelProps} from '@gravity-ui/components';
import {ActionsPanel} from '@gravity-ui/components';
import {Eye, EyeSlash, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {BatchFieldAction} from '../../constants';

const i18n = I18n.keyset('dataset.dataset-editor.modify');

export const BatchActionPanel = ({
    count,
    className,
    onAction,
    onClose,
    disableActions = [],
}: {
    count: number;
    className?: string;
    onAction: (action: BatchFieldAction) => void;
    onClose?: () => void;
    disableActions?: Array<'delete' | 'hide' | 'show'>;
}) => {
    const actions: ActionsPanelProps['actions'] = React.useMemo(() => {
        const actionsList = [];

        if (!disableActions.includes('delete')) {
            actionsList.push({
                id: 'delete',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={TrashBin} size="16" />,
                            i18n('button_batch-remove'),
                        ],
                        onClick: () => onAction(BatchFieldAction.Remove),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Remove),
                        text: i18n('button_batch-remove'),
                    },
                },
            });
        }
        if (!disableActions.includes('hide')) {
            actionsList.push({
                id: 'hide',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={EyeSlash} size="16" />,
                            i18n('button_batch-hide'),
                        ],
                        onClick: () => onAction(BatchFieldAction.Hide),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Hide),
                        text: i18n('button_batch-hide'),
                    },
                },
            });
        }

        if (!disableActions.includes('show')) {
            actionsList.push({
                id: 'show',
                button: {
                    props: {
                        children: [
                            <Icon key="icon" data={Eye} size="16" />,
                            i18n('button_batch-show'),
                        ],
                        onClick: () => onAction(BatchFieldAction.Show),
                    },
                },
                dropdown: {
                    item: {
                        action: () => onAction(BatchFieldAction.Show),
                        text: i18n('button_batch-show'),
                    },
                },
            });
        }

        return actionsList;
    }, [onAction, disableActions]);

    return (
        <ActionsPanel
            actions={actions}
            className={className}
            onClose={onClose}
            renderNote={() => i18n('label_batch-selected-fields-count', {value: count})}
        />
    );
};
