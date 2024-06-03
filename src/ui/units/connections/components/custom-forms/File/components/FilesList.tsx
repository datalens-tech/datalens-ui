import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ConnectorType} from 'shared';

import {FormTitle} from '../../../';
import type {ListItemProps} from '../../../../store';
import {getConnectorTitle} from '../../../../utils';
import {useFileContext} from '../context';
import type {FileListItem} from '../types';
import {
    getGroupedItems,
    getListItemById,
    getListItemHeight,
    getListItemId,
    isItemsMustBeGrouped,
    patchItemsByListData,
} from '../utils';

import {AddFileButton} from './AddFileButton';
import {ListItem} from './ListItem/ListItem';
import {ReplaceSourceButton} from './ReplaceSourceButton';

const b = block('conn-form-file');

type FilesListProps = {
    setSelectedItemId: (id: string) => void;
    items: ListItemProps[];
    selectedItemId: string;
    beingDeletedSourceId?: string;
    newConnection?: boolean;
};

export const FilesList = ({
    setSelectedItemId,
    items,
    selectedItemId,
    beingDeletedSourceId,
    newConnection,
}: FilesListProps) => {
    const {openSourcesDialog} = useFileContext();
    const groupedItems = React.useMemo(() => {
        const patchedItems = beingDeletedSourceId
            ? patchItemsByListData(items, beingDeletedSourceId)
            : items;
        return getGroupedItems(patchedItems);
    }, [items, beingDeletedSourceId]);
    const [selectedItemIndex, setSelectedItemIndex] = React.useState(
        getListItemById(groupedItems, selectedItemId).index,
    );

    const handleItemClick = React.useCallback(
        (item: ListItemData<FileListItem>) => {
            if ('groupTitle' in item) {
                return;
            }

            const nextSelectedItemId = getListItemId(item);
            setSelectedItemId(nextSelectedItemId);

            // Case: the user skipped the source selection dialog, and after
            // clicked on an item in the list to open the dialog again
            if ('file' in item && item.sourcesInfo && item.sourcesInfo.length > 1) {
                openSourcesDialog(item.id);
            }
        },
        [openSourcesDialog, setSelectedItemId],
    );

    const renderItem = React.useCallback((item: ListItemData<FileListItem>) => {
        if ('groupTitle' in item) {
            return (
                <div className={b('list-group-title', {'with-border': item.withBorder})}>
                    {item.groupTitle}
                </div>
            );
        }

        return <ListItem {...item} />;
    }, []);

    React.useEffect(() => {
        setSelectedItemIndex(getListItemById(groupedItems, selectedItemId).index);
    }, [groupedItems, selectedItemId]);

    return (
        <div className={b('list')}>
            <FormTitle
                className={b('list-title')}
                type={ConnectorType.File}
                title={getConnectorTitle(ConnectorType.File)}
                showArrow={newConnection}
            />
            <AddFileButton />
            <ReplaceSourceButton />
            <List
                className={b('list-container', {'with-group-titles': isItemsMustBeGrouped(items)})}
                itemClassName={b('list-item-wrap')}
                itemHeight={getListItemHeight}
                items={groupedItems}
                selectedItemIndex={selectedItemIndex}
                filterable={false}
                virtualized={false}
                onItemClick={handleItemClick}
                renderItem={renderItem}
            />
        </div>
    );
};
