import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import type {ButtonSize, ListProps} from '@gravity-ui/uikit';
import {Button, Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {TabMenuQA} from 'shared';

import './ListWithRemove.scss';

const b = block('list-with-remove');
const ITEM_HEIGHT = 40;

export interface ListWithRemoveProps<T> {
    /* * Properties of the List component*/
    list: ListProps<T>;
    /* * Callback to delete an element*/
    onRemove: (item: number) => void;
    /* * Do not show the delete button if there is only one item in the list*/
    disableSingleItemRemove?: boolean;
    /* * Size of the delete icon*/
    iconSize?: ButtonSize;
    /* * Show the icon only when hovering over a list item*/
    iconOnHover?: boolean;
}

export const ListWithRemove = <T extends object | string>({
    list,
    onRemove,
    disableSingleItemRemove,
    iconSize = 's',
    iconOnHover,
}: ListWithRemoveProps<T>): React.ReactElement => {
    const {renderItem = (item: T) => String(item), className, ...restListProps} = list;

    const showRemove = list.items.length > 1 || !disableSingleItemRemove;

    const wrappedRenderItem = (item: T, active: boolean, itemIndex: number) => (
        <div className={b('wrapper', {'icon-on-hover': iconOnHover, active})}>
            <div className={b('item')}>{renderItem(item, active, itemIndex)}</div>
            {showRemove && (
                <div className={b('remove')}>
                    <Button
                        qa={TabMenuQA.ItemRemove}
                        view="flat"
                        size={iconSize}
                        onClick={() => onRemove(itemIndex)}
                    >
                        <Icon data={Xmark} />
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className={className}>
            <List
                {...restListProps}
                itemsHeight={restListProps.items.length * ITEM_HEIGHT}
                renderItem={wrappedRenderItem}
                qa={TabMenuQA.List}
            />
        </div>
    );
};
