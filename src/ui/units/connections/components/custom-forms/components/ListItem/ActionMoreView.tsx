import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import type {DropdownMenuProps} from '@gravity-ui/uikit';
import {DropdownMenu, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {ConnectionsS3BaseQA} from 'shared/constants/qa/connections';

import type {ActionMore} from './types';

const i18n = I18n.keyset('connections.file.view');
const MORE_ICON_SIZE = 14;

export type ActionMoreViewProps<T = unknown> = Omit<ActionMore<T>, 'type'>;

export const ActionMoreView = <T extends unknown>(props: ActionMoreViewProps<T>) => {
    const {item, onReplace, onRename, onDelete} = props;
    const items: DropdownMenuProps<T>['items'] = [];

    if (onReplace) {
        items.push({
            text: i18n('label_action-replace'),
            action: (e) => {
                e.stopPropagation();
                onReplace(item);
            },
            qa: ConnectionsS3BaseQA.LIST_ITEM_ACTION_MORE_REPLACE,
        });
    }

    if (onRename) {
        items.push({
            text: i18n('label_action-rename'),
            action: (e) => {
                e.stopPropagation();
                onRename(item);
            },
            qa: ConnectionsS3BaseQA.LIST_ITEM_ACTION_MORE_RENAME,
        });
    }

    if (onDelete) {
        items.push([
            {
                text: i18n('label_action-delete'),
                action: (e) => {
                    e.stopPropagation();
                    onDelete(item);
                },
                theme: 'danger',
                qa: ConnectionsS3BaseQA.LIST_ITEM_ACTION_MORE_DELETE,
            },
        ]);
    }

    const handleSwitcherClick = React.useCallback<React.MouseEventHandler<HTMLElement>>((e) => {
        e?.stopPropagation();
    }, []);

    return (
        <DropdownMenu
            size="s"
            icon={
                <Icon
                    data={Ellipsis}
                    size={MORE_ICON_SIZE}
                    qa={ConnectionsS3BaseQA.LIST_ITEM_ACTION_MORE}
                />
            }
            items={items}
            onSwitcherClick={handleSwitcherClick}
        />
    );
};
