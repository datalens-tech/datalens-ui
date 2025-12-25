import React from 'react';

import {List, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {EntryScope} from 'shared';
import {WorkbookNavigationMinimalQa} from 'shared';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {PopupClassName} from '../constants';
import type {Item, SharedItem} from '../types';
type ListWithSharedEntriesProps = {
    items?: Item[];
    sharedItems?: SharedItem[];
    renderItem: (item: Item | SharedItem) => React.ReactNode;
    itemHeight: number;
    onItemClick: (item: Item | SharedItem) => void;
    scope: EntryScope.Connection | EntryScope.Dataset;
};

const b = block(PopupClassName);

export const ListWithSharedEntries = ({
    items,
    sharedItems = [],
    renderItem,
    itemHeight,
    scope,
    onItemClick,
}: ListWithSharedEntriesProps) => {
    return (
        <div className={b('items')}>
            {items && !!items.length && (
                <div className={b('items-box')}>
                    <Text className={b('list-title')} variant="subheader-1">
                        {getSharedEntryMockText('workbook-navigation-title', {
                            entry: getSharedEntryMockText(`entries-list-title-${scope}`),
                        })}
                    </Text>
                    <List
                        itemsHeight={items.length * itemHeight}
                        qa={WorkbookNavigationMinimalQa.List}
                        items={items}
                        filterable={false}
                        renderItem={renderItem}
                        itemHeight={itemHeight}
                        onItemClick={onItemClick}
                    />
                </div>
            )}
            {!!sharedItems.length && (
                <div className={b('items-box')}>
                    <Text className={b('list-title')} variant="subheader-1">
                        {getSharedEntryMockText('workbook-navigation-shared-title', {
                            entry: getSharedEntryMockText(`entries-list-title-${scope}`),
                        })}
                    </Text>
                    <List
                        itemsHeight={sharedItems.length * itemHeight}
                        qa={WorkbookNavigationMinimalQa.List}
                        items={sharedItems}
                        filterable={false}
                        renderItem={renderItem}
                        itemHeight={itemHeight}
                        onItemClick={onItemClick}
                    />
                </div>
            )}
        </div>
    );
};
