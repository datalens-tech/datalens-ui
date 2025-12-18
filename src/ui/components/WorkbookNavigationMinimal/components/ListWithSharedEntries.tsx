import React from 'react';

import {List, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {EntryScope} from 'shared';
import {WorkbookNavigationMinimalQa} from 'shared';

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

const i18n = I18n.keyset('component.workbook.navigation.view');
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
                        {i18n('workbook-list-title', {
                            entry: i18n(`entries-list-title-${scope}`),
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
                        {i18n('shared-list-title', {
                            entry: i18n(`entries-list-title-${scope}`),
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
