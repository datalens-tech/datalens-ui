import React from 'react';

import block from 'bem-cn-lite';

import {ActionDeleteView} from './ActionDeleteView';
import {ActionErrorView} from './ActionErrorView';
import {ActionMoreView} from './ActionMoreView';
import type {ListItemAction} from './types';

const b = block('conn-list-item');

type ListItemActionsProps<T = unknown> = {
    actions: ListItemAction<T>[];
};

export const ListItemActions = <T extends unknown>(props: ListItemActionsProps<T>) => {
    const {actions} = props;

    const actionNodes = React.useMemo(() => {
        return actions.map((action, index) => {
            const key = `list-item-action-${index}`;

            switch (action.type) {
                case 'delete': {
                    const {item, onClick} = action;
                    return <ActionDeleteView key={key} item={item} onClick={onClick} />;
                }
                case 'error': {
                    const {item, message, onClick} = action;
                    return (
                        <ActionErrorView
                            key={key}
                            item={item}
                            message={message}
                            onClick={onClick}
                        />
                    );
                }
                case 'more': {
                    const {item, onDelete, onRename, onReplace} = action;
                    return (
                        <ActionMoreView
                            key={key}
                            item={item}
                            onDelete={onDelete}
                            onRename={onRename}
                            onReplace={onReplace}
                        />
                    );
                }
                default: {
                    return null;
                }
            }
        });
    }, [actions]);

    return <div className={b('title-actions')}>{actionNodes}</div>;
};
