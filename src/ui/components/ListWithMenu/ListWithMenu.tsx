import React from 'react';

import {TrashBin} from '@gravity-ui/icons';
import {DropdownMenu, DropdownMenuItem, Icon, List, ListProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {TabMenuQA} from 'shared';
import {TabActionType} from 'ui/units/dash/containers/Dialogs/Widget/TabMenu/TabMenu';

import './ListWithMenu.scss';

const b = block('list-with-menu');
const i18n = I18n.keyset('component.list-with-menu.view');

export interface ListWithMenuProps<T> {
    /* * Properties of the List component*/
    list: ListProps<T>;
    /* * Callback to delete an element*/
    onRemove: (item: number) => void;
    /* * Callback to an action with an element*/
    onAction: ({
        action,
        index,
    }: {
        action: TabActionType;
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
}: ListWithMenuProps<T>): React.ReactElement => {
    const {items, ...restListProps} = list;

    const [expandedItemIndex, setExpandedItemIndex] = React.useState<number | undefined>(undefined);

    const isMultipleItems = items.length > 1;

    const handleMenuToggle = React.useCallback(
        (itemIndex: number) => () => {
            setExpandedItemIndex(itemIndex === expandedItemIndex ? undefined : itemIndex);
        },
        [setExpandedItemIndex, expandedItemIndex],
    );

    const onRemoveItem = React.useCallback(() => {
        if (expandedItemIndex !== undefined) {
            onRemove(expandedItemIndex);
        }
    }, [onRemove, expandedItemIndex]);

    const customMenuOptions: DropdownMenuItem[] = [
        {
            action: () => onRemoveItem(),
            text: i18n('button_delete'),
            icon: <Icon data={TrashBin} />,
        },
    ];

    const wrappedRenderItem = (item: T, active: boolean, itemIndex: number) => {
        return (
            <div className={b('wrapper', {'icon-on-hover': iconOnHover, active})}>
                <div
                    className={b('item')}
                    onClick={onAction({action: 'changeChosen', index: itemIndex})}
                    key={itemIndex}
                    data-qa={TabMenuQA.Item}
                >
                    <div className={b('item-content')}>
                        <span title={item.title} className={b('item-text')}>
                            {item.title}
                        </span>
                    </div>
                </div>

                {isMultipleItems && (
                    <div className={b('controls')}>
                        <DropdownMenu
                            size="m"
                            onOpenToggle={handleMenuToggle(itemIndex)}
                            items={customMenuOptions}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <List
            {...restListProps}
            items={items}
            activeItemIndex={expandedItemIndex}
            renderItem={wrappedRenderItem}
            qa={TabMenuQA.List}
        />
    );
};
