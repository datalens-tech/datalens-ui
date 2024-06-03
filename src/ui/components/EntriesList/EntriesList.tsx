import React from 'react';

import {List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {ItemProps} from './Item/Item';
import {Item} from './Item/Item';
import type {EntryItem} from './types';

import './EntriesList.scss';

const b = block('dl-entries-list');
const ITEM_HEIGHT = 40;

export type EntriesListProps<T extends EntryItem = EntryItem> = Pick<
    ItemProps<T>,
    'renderAction'
> & {
    entries: T[];
    className?: string;
};

export const EntriesList = <T extends EntryItem = EntryItem>({
    entries,
    className,
    renderAction,
}: EntriesListProps<T>) => {
    return (
        <div className={b(null, className)}>
            <List<T>
                items={entries}
                itemHeight={ITEM_HEIGHT}
                itemsHeight={entries.length * ITEM_HEIGHT}
                virtualized={true}
                filterable={false}
                sortable={false}
                renderItem={(item, _isItemActive, itemIndex) => (
                    <Item item={item} itemIndex={itemIndex} renderAction={renderAction} />
                )}
            />
        </div>
    );
};
