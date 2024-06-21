import React from 'react';

import {Copy, CopyArrowRight, TrashBin} from '@gravity-ui/icons';
import type {DropdownMenuItem, ListProps} from '@gravity-ui/uikit';
import {DropdownMenu, Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DialogGroupControlQa, TabMenuQA} from 'shared';
import {TabActionType} from 'ui/units/dash/containers/Dialogs/Widget/TabMenu/types';

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
}

type ItemWithTitle = {
    title?: string;
};

export const ListWithMenu = <T extends ItemWithTitle>({
    list,
    onRemove,
    iconOnHover,
    onAction,
    onDuplicate,
    onCopy,
}: ListWithMenuProps<T>): React.ReactElement => {
    const {items, className, ...restListProps} = list;

    const [expandedItemIndex, setExpandedItemIndex] = React.useState<number | undefined>(undefined);

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
        return (
            <div
                className={b('wrapper', {'icon-on-hover': iconOnHover, active})}
                data-qa={TabMenuQA.Item}
            >
                <div
                    className={b('item')}
                    onClick={onAction({action: TabActionType.ChangeChosen, index: itemIndex})}
                    key={itemIndex}
                >
                    <div className={b('item-content')}>
                        <span title={item.title} className={b('item-text')}>
                            {item.title}
                        </span>
                    </div>
                </div>

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
                qa={TabMenuQA.List}
            />
        </div>
    );
};
