import React from 'react';

import {Copy, CopyArrowRight, TrashBin} from '@gravity-ui/icons';
import type {DropdownMenuItem, ListProps} from '@gravity-ui/uikit';
import {DropdownMenu, Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DialogGroupControlQa, TabMenuQA} from 'shared';
import {TabActionType} from 'ui/components/TabMenu/types';
import EditedTabItem from 'ui/units/dash/containers/Dialogs/Tabs/EditedTabItem';

import './ListWithMenu.scss';

const b = block('list-with-menu');
const i18n = I18n.keyset('component.list-with-menu.view');
const ITEM_HEIGHT = 40;

export interface ListWithMenuProps<T> {
    /* * Properties of the List component*/
    list: ListProps<T>;
    /* * Callback to delete an element*/
    onRemove: (itemIndex: number) => void;
    onDuplicate: (itemIndex: number) => void;
    onCopy?: (itemIndex: number) => void;
    /* * Callback to an action with an element*/
    onAction: ({
        action,
        index,
    }: {
        action: Exclude<TabActionType, 'skipped'>;
        index: number;
    }) => React.MouseEventHandler<HTMLDivElement>;
    /* * Show the icon only when hovering over a list item*/
    iconOnHover?: boolean;
    /* * Callback on update item data via TabMenu */
    onUpdateItem: (title: string) => void;
}

type ItemWithTitleAndDraftId = {
    title?: string;
    draftId?: string;
};

export const ListWithMenu = <T extends ItemWithTitleAndDraftId>({
    list,
    onRemove,
    iconOnHover,
    onAction,
    onDuplicate,
    onCopy,
    onUpdateItem,
}: ListWithMenuProps<T>): React.ReactElement => {
    const {items, className, ...restListProps} = list;

    const [expandedItemIndex, setExpandedItemIndex] = React.useState<number | undefined>(undefined);
    const [itemIndexWithEdit, setItemIndexWithEdit] = React.useState<number | null>(null);

    const isMultipleItems = items.length > 1;

    const handleMenuToggle = React.useCallback(
        (itemIndex: number) => () => {
            setExpandedItemIndex(itemIndex === expandedItemIndex ? undefined : itemIndex);
        },
        [setExpandedItemIndex, expandedItemIndex],
    );

    const onRemoveItem = () => {
        if (expandedItemIndex !== undefined) {
            onRemove(expandedItemIndex);
        }
    };

    const onDuplicateItem = () => {
        if (expandedItemIndex !== undefined) {
            onDuplicate(expandedItemIndex);
        }
    };

    const onCopyItem = () => {
        if (expandedItemIndex !== undefined) {
            onCopy?.(expandedItemIndex);
        }
    };

    const handleItemClick = (
        _item: T,
        index: number,
        _fromKeyboard?: boolean,
        event?: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLElement>,
    ) => {
        // focus when clicking on object is needed to correctly work out the hiding of TextInput on blur
        // https://github.com/atlassian/react-beautiful-dnd/issues/410
        if (
            !event ||
            event.defaultPrevented ||
            itemIndexWithEdit === null ||
            index === itemIndexWithEdit
        ) {
            return;
        }

        event.currentTarget.focus();
    };

    const customMenuOptions: DropdownMenuItem[] = [
        {
            action: onDuplicateItem,
            text: i18n('button_duplicate'),
            icon: <Icon data={Copy} />,
            className: b('menu-button'),
            qa: DialogGroupControlQa.duplicateControlButton,
        },
        {
            action: onCopyItem,
            text: i18n('button_copy'),
            icon: <Icon data={CopyArrowRight} />,
            className: b('menu-button'),
            qa: DialogGroupControlQa.copyControlButton,
        },
    ];

    if (isMultipleItems) {
        customMenuOptions.push({
            action: onRemoveItem,
            text: i18n('button_delete'),
            icon: <Icon data={TrashBin} />,
            className: b('delete-button'),
            qa: DialogGroupControlQa.removeControlButton,
        });
    }

    const wrappedRenderItem = (item: T, active: boolean, itemIndex: number) => {
        const handleTitleCommit = (text: string) => {
            if (itemIndexWithEdit !== null) {
                onUpdateItem(text);
                setItemIndexWithEdit(null);
            }
        };

        const handleDoubleClick = () => {
            setItemIndexWithEdit(itemIndex);
        };

        const showEdit = itemIndex === itemIndexWithEdit;

        return (
            <div
                className={b('wrapper', {'icon-on-hover': iconOnHover, active})}
                data-qa={TabMenuQA.Item}
            >
                {showEdit ? (
                    <div className={b('item')}>
                        <EditedTabItem
                            onCommit={handleTitleCommit}
                            id={item.draftId || String(itemIndex)}
                            title={item.title || ''}
                        />
                    </div>
                ) : (
                    <div
                        className={b('item')}
                        onClick={onAction({action: TabActionType.ChangeChosen, index: itemIndex})}
                        key={item.draftId || String(itemIndex)}
                        onDoubleClick={handleDoubleClick}
                    >
                        <div className={b('item-content')}>
                            <span title={item.title} className={b('item-text')}>
                                {item.title}
                            </span>
                        </div>
                    </div>
                )}

                <div className={b('controls')}>
                    <DropdownMenu
                        size="m"
                        onOpenToggle={handleMenuToggle(itemIndex)}
                        items={customMenuOptions}
                        defaultSwitcherProps={{qa: DialogGroupControlQa.controlMenu}}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={className}>
            <List
                {...restListProps}
                items={items}
                itemsHeight={items.length * ITEM_HEIGHT}
                activeItemIndex={expandedItemIndex}
                renderItem={wrappedRenderItem}
                onItemClick={handleItemClick}
                qa={TabMenuQA.List}
            />
        </div>
    );
};